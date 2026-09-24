"""HTTP client for kie.ai Market video jobs and file uploads."""

from __future__ import annotations

import json
import mimetypes
import time
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlparse

import requests

from .models import MODEL_PRESETS, ModelPreset


class KieAPIError(RuntimeError):
    """Raised when the kie.ai API returns an error response."""

    def __init__(self, message: str, *, code: int | None = None, payload: Any = None):
        super().__init__(message)
        self.code = code
        self.payload = payload


class KieClient:
    """Thin wrapper around kie.ai createTask / recordInfo / file upload."""

    def __init__(
        self,
        api_key: str,
        *,
        api_base_url: str = "https://api.kie.ai",
        upload_base_url: str = "https://kieai.redpandaai.co",
        timeout: float = 60.0,
        session: requests.Session | None = None,
    ) -> None:
        if not api_key or api_key == "your_api_key_here":
            raise ValueError(
                "Missing KIE_API_KEY. Copy .env.example to .env and add your key "
                "from https://kie.ai/api-key"
            )
        self.api_key = api_key
        self.api_base_url = api_base_url.rstrip("/")
        self.upload_base_url = upload_base_url.rstrip("/")
        self.timeout = timeout
        self.session = session or requests.Session()

    @property
    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _auth_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }

    def _raise_for_api(self, response: requests.Response) -> dict[str, Any]:
        try:
            payload = response.json()
        except ValueError as exc:
            raise KieAPIError(
                f"Non-JSON response ({response.status_code}): {response.text[:300]}",
                code=response.status_code,
            ) from exc

        if response.status_code == 401 or payload.get("code") == 401:
            raise KieAPIError(
                "401 Unauthorized — check that KIE_API_KEY is valid "
                "and the Authorization header is `Bearer <key>`.",
                code=401,
                payload=payload,
            )
        if response.status_code == 429 or payload.get("code") == 429:
            raise KieAPIError(
                "429 Too Many Requests — slow down (limit ~20 creates / 10s).",
                code=429,
                payload=payload,
            )
        if response.status_code == 402 or payload.get("code") == 402:
            raise KieAPIError(
                "402 Insufficient credits — add balance at https://kie.ai",
                code=402,
                payload=payload,
            )

        ok = payload.get("success") is True or payload.get("code") in (200, 505, None)
        if response.status_code >= 400 or (
            "code" in payload and payload["code"] not in (200, 505) and not payload.get("success")
        ):
            msg = payload.get("msg") or payload.get("message") or response.text[:300]
            raise KieAPIError(str(msg), code=payload.get("code") or response.status_code, payload=payload)

        if not ok and payload.get("success") is False:
            raise KieAPIError(
                str(payload.get("msg") or "Upload failed"),
                code=payload.get("code"),
                payload=payload,
            )
        return payload

    def upload_file(
        self,
        path: str | Path,
        *,
        upload_path: str = "images/product-showcase",
        file_name: str | None = None,
    ) -> str:
        """Upload a local image and return its public downloadUrl."""
        path = Path(path).expanduser().resolve()
        if not path.is_file():
            raise FileNotFoundError(f"Image not found: {path}")

        name = file_name or path.name
        mime, _ = mimetypes.guess_type(name)
        mime = mime or "application/octet-stream"

        url = f"{self.upload_base_url}/api/file-stream-upload"
        with path.open("rb") as fh:
            response = self.session.post(
                url,
                headers=self._auth_headers(),
                files={"file": (name, fh, mime)},
                data={"uploadPath": upload_path, "fileName": name},
                timeout=self.timeout,
            )
        payload = self._raise_for_api(response)
        data = payload.get("data") or {}
        download_url = data.get("downloadUrl")
        if not download_url:
            raise KieAPIError("Upload succeeded but no downloadUrl returned", payload=payload)
        return download_url

    def resolve_image_url(self, image: str) -> str:
        """Accept a public URL or local path; upload local files automatically."""
        parsed = urlparse(image)
        if parsed.scheme in ("http", "https"):
            return image
        return self.upload_file(image)

    def create_task(
        self,
        *,
        model: str,
        input_payload: dict[str, Any],
        callback_url: str | None = None,
    ) -> str:
        """Create a generation task; returns taskId (not a finished video)."""
        body: dict[str, Any] = {"model": model, "input": input_payload}
        if callback_url:
            body["callBackUrl"] = callback_url

        response = self.session.post(
            f"{self.api_base_url}/api/v1/jobs/createTask",
            headers=self._headers,
            json=body,
            timeout=self.timeout,
        )
        payload = self._raise_for_api(response)
        data = payload.get("data") or {}
        task_id = data.get("taskId") or data.get("task_id")
        if not task_id:
            raise KieAPIError("createTask response missing taskId", payload=payload)
        return task_id

    def get_task(self, task_id: str) -> dict[str, Any]:
        """Fetch task record (state, resultJson, failMsg, …)."""
        response = self.session.get(
            f"{self.api_base_url}/api/v1/jobs/recordInfo",
            headers=self._headers,
            params={"taskId": task_id},
            timeout=self.timeout,
        )
        payload = self._raise_for_api(response)
        data = payload.get("data")
        if not isinstance(data, dict):
            raise KieAPIError("recordInfo returned no data", payload=payload)
        return data

    @staticmethod
    def parse_result_urls(task: dict[str, Any]) -> list[str]:
        raw = task.get("resultJson") or ""
        if not raw:
            return []
        if isinstance(raw, dict):
            parsed = raw
        else:
            parsed = json.loads(raw)
        urls = parsed.get("resultUrls") or parsed.get("result_urls") or []
        return list(urls)

    def wait_for_task(
        self,
        task_id: str,
        *,
        poll_interval: float = 12.0,
        timeout: float = 900.0,
        on_update: Callable[[dict[str, Any]], None] | None = None,
    ) -> dict[str, Any]:
        """Poll until state is success or fail (or timeout)."""
        deadline = time.monotonic() + timeout
        last_state: str | None = None

        while True:
            task = self.get_task(task_id)
            state = (task.get("state") or "").lower()
            if on_update and state != last_state:
                on_update(task)
                last_state = state

            if state == "success":
                return task
            if state == "fail":
                msg = task.get("failMsg") or task.get("failCode") or "Generation failed"
                raise KieAPIError(f"Task {task_id} failed: {msg}", payload=task)

            if time.monotonic() >= deadline:
                raise TimeoutError(
                    f"Timed out after {timeout:.0f}s waiting for task {task_id} "
                    f"(last state={state or 'unknown'})"
                )
            time.sleep(poll_interval)

    def download_video(self, url: str, dest: str | Path) -> Path:
        """Download a finished video URL to local storage (kie deletes after ~14 days)."""
        dest = Path(dest)
        dest.parent.mkdir(parents=True, exist_ok=True)
        with self.session.get(url, stream=True, timeout=self.timeout) as response:
            response.raise_for_status()
            with dest.open("wb") as fh:
                for chunk in response.iter_content(chunk_size=1024 * 256):
                    if chunk:
                        fh.write(chunk)
        return dest

    def generate_product_video(
        self,
        *,
        image: str,
        prompt: str,
        model_key: str = "grok-imagine",
        duration: int = 5,
        aspect_ratio: str = "16:9",
        resolution: str = "720p",
        generate_audio: bool = False,
        mode: str = "normal",
        image_end: str | None = None,
        callback_url: str | None = None,
        poll: bool = True,
        poll_interval: float = 12.0,
        timeout: float = 900.0,
        output_dir: str | Path = "output",
        on_update: Callable[[dict[str, Any]], None] | None = None,
        extra_input: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Full product-showcase flow: resolve image(s) → createTask → poll → download."""
        preset = self._resolve_preset(model_key)
        image_urls = [self.resolve_image_url(image)]
        if image_end and preset.max_images >= 2:
            image_urls.append(self.resolve_image_url(image_end))
        input_payload = preset.build_input(
            prompt=prompt,
            image_urls=image_urls,
            duration=duration,
            aspect_ratio=aspect_ratio,
            resolution=resolution,
            generate_audio=generate_audio,
            mode=mode,
            extra=extra_input,
        )
        task_id = self.create_task(
            model=preset.model_id,
            input_payload=input_payload,
            callback_url=callback_url,
        )

        result: dict[str, Any] = {
            "task_id": task_id,
            "model": preset.model_id,
            "image_url": image_urls[0],
            "image_urls": image_urls,
            "result_urls": [],
            "local_paths": [],
            "task": None,
        }

        if not poll:
            return result

        task = self.wait_for_task(
            task_id,
            poll_interval=poll_interval,
            timeout=timeout,
            on_update=on_update,
        )
        result["task"] = task
        urls = self.parse_result_urls(task)
        result["result_urls"] = urls

        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        for index, url in enumerate(urls):
            suffix = Path(urlparse(url).path).suffix or ".mp4"
            dest = output_dir / f"{task_id}_{index}{suffix}"
            self.download_video(url, dest)
            result["local_paths"].append(str(dest.resolve()))

        return result

    @staticmethod
    def _resolve_preset(model_key: str) -> ModelPreset:
        if model_key in MODEL_PRESETS:
            return MODEL_PRESETS[model_key]
        for preset in MODEL_PRESETS.values():
            if preset.model_id == model_key:
                return preset
        known = ", ".join(sorted(MODEL_PRESETS))
        raise ValueError(f"Unknown model '{model_key}'. Choose one of: {known}")
