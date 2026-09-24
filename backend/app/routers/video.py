from __future__ import annotations

import shutil
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.auth import get_current_user
from app.config import get_settings
from app.kie_video.client import KieAPIError, KieClient
from app.kie_video.models import DEFAULT_MODEL, DEFAULT_PROMPT, MODEL_PRESETS

BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_ROOT / "uploads"
OUTPUT_DIR = BACKEND_ROOT / "output"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"}

router = APIRouter(prefix="/video", tags=["video"])


def get_client() -> KieClient:
    settings = get_settings()
    try:
        return KieClient(
            settings.kie_api_key.strip(),
            api_base_url=settings.kie_api_base_url,
            upload_base_url=settings.kie_upload_base_url,
        )
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


async def save_upload(upload: UploadFile | None) -> Path | None:
    if not upload or not upload.filename:
        return None
    suffix = Path(upload.filename).suffix.lower() or ".png"
    if suffix not in ALLOWED_IMAGE_SUFFIXES:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {suffix}")
    dest = UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"
    with dest.open("wb") as fh:
        shutil.copyfileobj(upload.file, fh)
    return dest


@router.get("/health")
async def health(_: dict = Depends(get_current_user)) -> dict[str, Any]:
    settings = get_settings()
    key = settings.kie_api_key.strip()
    configured = bool(key) and key not in {"your_api_key_here", "your_real_key_here"}
    return {
        "ok": True,
        "api_key_configured": configured,
        "models": [preset.to_public_dict(k) for k, preset in MODEL_PRESETS.items()],
        "default_prompt": DEFAULT_PROMPT,
        "default_model": DEFAULT_MODEL,
    }


@router.get("/credits")
async def credits(_: dict = Depends(get_current_user)) -> dict[str, Any]:
    client = get_client()
    try:
        response = client.session.get(
            f"{client.api_base_url}/api/v1/chat/credit",
            headers=client._headers,
            timeout=client.timeout,
        )
        payload = client._raise_for_api(response)
        return {"credits": payload.get("data")}
    except KieAPIError as exc:
        raise HTTPException(status_code=exc.code or 502, detail=str(exc)) from exc


@router.post("/generate")
async def generate(
    prompt: str = Form(...),
    model: str = Form(DEFAULT_MODEL),
    duration: int = Form(5),
    aspect_ratio: str = Form("16:9"),
    resolution: str = Form("720p"),
    audio: str = Form("false"),
    mode: str = Form("normal"),
    image: UploadFile | None = File(None),
    image2: UploadFile | None = File(None),
    _: dict = Depends(get_current_user),
) -> dict[str, Any]:
    """Start a generation job. Credits are only used when this endpoint is called."""
    prompt = (prompt or "").strip()
    if len(prompt) < 3:
        raise HTTPException(status_code=400, detail="Prompt must be at least 3 characters.")
    if model not in MODEL_PRESETS:
        raise HTTPException(status_code=400, detail=f"Unknown model: {model}")

    preset = MODEL_PRESETS[model]
    want_audio = str(audio).strip().lower() in {"1", "true", "yes", "on"}

    local_image = await save_upload(image)
    local_image2 = await save_upload(image2) if preset.max_images >= 2 else None

    if local_image is None:
        raise HTTPException(status_code=400, detail="Upload at least one product image.")

    client = get_client()
    try:
        image_urls = [client.resolve_image_url(str(local_image))]
        if local_image2 is not None:
            image_urls.append(client.resolve_image_url(str(local_image2)))

        input_payload = preset.build_input(
            prompt=prompt,
            image_urls=image_urls,
            duration=duration,
            aspect_ratio=aspect_ratio,
            resolution=resolution,
            generate_audio=want_audio,
            mode=mode,
        )
        task_id = client.create_task(model=preset.model_id, input_payload=input_payload)
    except KieAPIError as exc:
        raise HTTPException(status_code=exc.code or 502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "task_id": task_id,
        "model": model,
        "model_id": preset.model_id,
        "image_urls": image_urls,
        "prompt": prompt,
    }


@router.get("/tasks/{task_id}")
async def task_status(task_id: str, _: dict = Depends(get_current_user)) -> dict[str, Any]:
    client = get_client()
    try:
        task = client.get_task(task_id)
    except KieAPIError as exc:
        raise HTTPException(status_code=exc.code or 502, detail=str(exc)) from exc

    state = (task.get("state") or "").lower()
    result_urls = client.parse_result_urls(task) if state == "success" else []
    local_paths: list[str] = []
    video_urls: list[str] = []

    if state == "success" and result_urls:
        for index, url in enumerate(result_urls):
            dest = OUTPUT_DIR / f"{task_id}_{index}.mp4"
            if not dest.exists():
                try:
                    client.download_video(url, dest)
                except Exception as exc:
                    raise HTTPException(status_code=502, detail=f"Download failed: {exc}") from exc
            local_paths.append(str(dest))
            video_urls.append(f"/api/video/videos/{dest.name}")

    return {
        "task_id": task_id,
        "state": state,
        "fail_msg": task.get("failMsg") or "",
        "credits_consumed": task.get("creditsConsumed"),
        "result_urls": result_urls,
        "video_urls": video_urls,
        "local_paths": local_paths,
    }


@router.get("/videos/{filename}")
async def serve_video(filename: str, _: dict = Depends(get_current_user)) -> FileResponse:
    safe = Path(filename).name
    path = OUTPUT_DIR / safe
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Video not found.")
    return FileResponse(path, media_type="video/mp4", filename=safe)


@router.get("/gallery")
async def gallery(_: dict = Depends(get_current_user)) -> dict[str, Any]:
    videos = sorted(OUTPUT_DIR.glob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
    return {
        "items": [
            {
                "name": p.name,
                "url": f"/api/video/videos/{p.name}",
                "size_mb": round(p.stat().st_size / (1024 * 1024), 1),
            }
            for p in videos
        ]
    }
