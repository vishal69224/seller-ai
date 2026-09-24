"""Supported image-to-video model presets for product showcases."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal


ImageMode = Literal[
    "image_urls",
    "image_url",
    "first_last",
    "image_url_end",
]


@dataclass(frozen=True)
class ModelPreset:
    """How to map product photo(s) + prompt into a createTask payload."""

    model_id: str
    label: str
    description: str
    cost_tier: Literal["low", "mid", "high"]
    cost_hint: str
    max_images: int = 1
    image_mode: ImageMode = "image_urls"
    durations: tuple[int, ...] = (5, 10)
    resolutions: tuple[str, ...] = ("720p", "1080p")
    default_duration: int = 5
    default_resolution: str = "720p"
    supports_audio: bool = False
    supports_mode: bool = False
    second_image_label: str = "End frame (optional)"

    def build_input(
        self,
        *,
        prompt: str,
        image_urls: list[str],
        duration: int,
        aspect_ratio: str,
        resolution: str,
        generate_audio: bool = False,
        mode: str = "normal",
        extra: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not image_urls:
            raise ValueError("At least one image URL is required.")
        urls = image_urls[: self.max_images]
        primary = urls[0]
        secondary = urls[1] if len(urls) > 1 else None

        if self.image_mode == "first_last":
            payload: dict[str, Any] = {
                "prompt": prompt,
                "first_frame_url": primary,
                "duration": int(duration),
                "aspect_ratio": aspect_ratio,
                "resolution": resolution,
            }
            if secondary:
                payload["last_frame_url"] = secondary
            if self.supports_audio:
                payload["generate_audio"] = generate_audio
            if self.model_id.startswith("wan/2-7"):
                payload = {
                    "prompt": prompt,
                    "first_frame_url": primary,
                    "duration": int(duration),
                    "resolution": resolution if resolution in self.resolutions else self.default_resolution,
                    "prompt_extend": True,
                    "watermark": False,
                }
                if secondary:
                    payload["last_frame_url"] = secondary

        elif self.image_mode == "image_url":
            payload = {
                "prompt": prompt,
                "image_url": primary,
                "duration": str(duration),
                "resolution": resolution if resolution in self.resolutions else self.default_resolution,
            }

        elif self.image_mode == "image_url_end":
            payload = {
                "prompt": prompt,
                "image_url": primary,
                "duration": str(duration),
            }
            if resolution in self.resolutions:
                payload["resolution"] = resolution
            if secondary:
                payload["end_image_url"] = secondary

        else:
            payload = {
                "prompt": prompt,
                "image_urls": urls,
                "duration": str(duration),
            }
            if self.model_id.startswith("kling"):
                payload["sound"] = generate_audio
            if self.model_id.startswith("wan/2-6"):
                payload["resolution"] = resolution if resolution in self.resolutions else self.default_resolution
            if self.model_id.startswith("grok-imagine"):
                payload["mode"] = mode if mode in {"fun", "normal"} else "normal"
                payload["resolution"] = resolution if resolution in self.resolutions else self.default_resolution
                if len(urls) > 1:
                    payload["aspect_ratio"] = aspect_ratio

        if extra:
            payload.update(extra)
        return payload

    def to_public_dict(self, key: str) -> dict[str, Any]:
        return {
            "key": key,
            "label": self.label,
            "description": self.description,
            "cost_tier": self.cost_tier,
            "cost_hint": self.cost_hint,
            "max_images": self.max_images,
            "second_image_label": self.second_image_label,
            "durations": list(self.durations),
            "resolutions": list(self.resolutions),
            "default_duration": self.default_duration,
            "default_resolution": self.default_resolution,
            "supports_audio": self.supports_audio,
            "supports_mode": self.supports_mode,
        }


MODEL_PRESETS: dict[str, ModelPreset] = {
    "grok-imagine": ModelPreset(
        model_id="grok-imagine/image-to-video",
        label="Grok Imagine",
        description="Low cost · realistic motion · up to 2 reference images",
        cost_tier="low",
        cost_hint="~20 credits / 6s",
        max_images=2,
        image_mode="image_urls",
        durations=(6, 10),
        resolutions=("480p", "720p"),
        default_duration=6,
        default_resolution="480p",
        supports_mode=True,
        second_image_label="2nd reference image (optional)",
    ),
    "seedance-1-pro-fast": ModelPreset(
        model_id="bytedance/v1-pro-fast-image-to-video",
        label="Seedance 1.0 Pro Fast",
        description="Lowest cost Seedance · fast 720p/1080p product clips",
        cost_tier="low",
        cost_hint="~16 credits / 10s",
        max_images=1,
        image_mode="image_url",
        durations=(5, 10),
        resolutions=("720p", "1080p"),
        default_duration=5,
        default_resolution="720p",
    ),
    "wan-2.6": ModelPreset(
        model_id="wan/2-6-image-to-video",
        label="Wan 2.6",
        description="Budget-friendly · solid general product motion",
        cost_tier="low",
        cost_hint="Budget · 5–15s",
        max_images=1,
        image_mode="image_urls",
        durations=(5, 10, 15),
        resolutions=("720p", "1080p"),
        default_duration=5,
        default_resolution="720p",
    ),
    "seedance-2-mini": ModelPreset(
        model_id="bytedance/seedance-2-mini",
        label="Seedance 2.0 Mini",
        description="Cheapest Seedance 2 · start + optional end frame",
        cost_tier="low",
        cost_hint="Lowest Seedance 2 tier",
        max_images=2,
        image_mode="first_last",
        durations=(5, 8, 10),
        resolutions=("480p", "720p"),
        default_duration=5,
        default_resolution="720p",
        supports_audio=True,
        second_image_label="End frame (optional)",
    ),
    "wan-2.7": ModelPreset(
        model_id="wan/2-7-image-to-video",
        label="Wan 2.7",
        description="Start + end frame control · good product transitions",
        cost_tier="low",
        cost_hint="Budget · dual-frame",
        max_images=2,
        image_mode="first_last",
        durations=(5, 10),
        resolutions=("720p", "1080p"),
        default_duration=5,
        default_resolution="720p",
        second_image_label="End frame (optional)",
    ),
    "hailuo-02": ModelPreset(
        model_id="hailuo/02-image-to-video-standard",
        label="Hailuo 2.3 Standard",
        description="Expressive motion · optional end frame",
        cost_tier="mid",
        cost_hint="~30 credits / 6s",
        max_images=2,
        image_mode="image_url_end",
        durations=(6, 10),
        resolutions=("512P", "768P"),
        default_duration=6,
        default_resolution="768P",
        second_image_label="End frame (optional)",
    ),
    "kling-2.6": ModelPreset(
        model_id="kling-2.6/image-to-video",
        label="Kling 2.6",
        description="Smooth e-commerce camera moves",
        cost_tier="mid",
        cost_hint="~55 credits / 5s",
        max_images=1,
        image_mode="image_urls",
        durations=(5, 10),
        resolutions=("720p",),
        default_duration=5,
        default_resolution="720p",
        supports_audio=True,
    ),
    "seedance-2-fast": ModelPreset(
        model_id="bytedance/seedance-2-fast",
        label="Seedance 2.0 Fast",
        description="Faster Seedance 2 drafts · start + optional end frame",
        cost_tier="high",
        cost_hint="Higher credits",
        max_images=2,
        image_mode="first_last",
        durations=(5, 10),
        resolutions=("480p", "720p", "1080p"),
        default_duration=5,
        default_resolution="720p",
        supports_audio=True,
        second_image_label="End frame (optional)",
    ),
    "seedance-2": ModelPreset(
        model_id="bytedance/seedance-2",
        label="Seedance 2.0",
        description="Premium product turntable / close-ups",
        cost_tier="high",
        cost_hint="Highest quality · more credits",
        max_images=2,
        image_mode="first_last",
        durations=(5, 10, 15),
        resolutions=("480p", "720p", "1080p"),
        default_duration=5,
        default_resolution="720p",
        supports_audio=True,
        second_image_label="End frame (optional)",
    ),
}

DEFAULT_MODEL = "grok-imagine"

DEFAULT_PROMPT = (
    "Slow 360-degree orbit around the product on a reflective white surface, "
    "soft studio lighting, subtle shadow, clean minimal background, "
    "camera slowly pushes in at the end."
)
