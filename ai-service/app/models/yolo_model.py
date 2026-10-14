
"""
YOLOv8 model wrapper.
Loads best.pt once at startup and runs memory-conscious inference.
"""

import gc
import logging

from ultralytics import YOLO

from app.config import (
    MODEL_PATH,
    IMG_SIZE,
    CONF_THRESHOLD,
    IOU_THRESHOLD,
    CLASS_NAMES,
)

logger = logging.getLogger("dental_ai.model")


class DentalYOLOModel:
    """Singleton-style wrapper around the trained YOLOv8 model."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load()
        return cls._instance

    def _load(self):
        """Load the trained dental model once on CPU."""
        logger.info("Loading YOLOv8 model from %s", MODEL_PATH)

        self.model = YOLO(MODEL_PATH)
        self.model.to("cpu")

        logger.info("Model loaded successfully.")
        logger.info("Model class names: %s", self.model.names)
        logger.info("Inference image size: %s", IMG_SIZE)

    def predict(self, image_path: str):
        """Run inference on one image and return its Results object."""
        results = None

        try:
            results = self.model.predict(
                source=image_path,
                imgsz=IMG_SIZE,
                conf=CONF_THRESHOLD,
                iou=IOU_THRESHOLD,
                device="cpu",
                verbose=False,
                half=False,
                stream=False,
                max_det=100,
                save=False,
            )

            if results is None or len(results) == 0:
                raise RuntimeError("YOLO returned no prediction results.")

            return results[0]

        finally:
            # The returned Results object remains available to the caller.
            del results
            gc.collect()

    def parse_detections(self, result):
        """Convert YOLO results into the existing API response format."""
        detections = []
        boxes = result.boxes

        if boxes is None or len(boxes) == 0:
            return detections

        for box in boxes:
            cls_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            x1, y1, x2, y2 = [
                float(value) for value in box.xyxy[0].tolist()
            ]

            class_name = CLASS_NAMES.get(cls_id, f"class_{cls_id}")

            detections.append({
                "classId": cls_id,
                "class_id": cls_id,
                "className": class_name,
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "bbox": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2),
                },
            })

        detections.sort(
            key=lambda item: item["confidence"],
            reverse=True,
        )

        return detections


# Load the model once when the application starts.
dental_model = DentalYOLOModel()
