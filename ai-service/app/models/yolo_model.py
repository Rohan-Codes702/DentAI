"""
YOLOv8 model wrapper.
Loads best.pt ONCE at startup (not per-request) and exposes a
simple `predict()` method used by the /predict route.
"""
import logging
from ultralytics import YOLO

from app.config import (
    MODEL_PATH,
    IMG_SIZE,
    CONF_THRESHOLD,
    IOU_THRESHOLD,
    DEVICE,
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
        logger.info(f"Loading YOLOv8 model from {MODEL_PATH} on device={DEVICE}")
        self.model = YOLO(MODEL_PATH)
        self.model.to(DEVICE)
        logger.info("Model loaded successfully.")
        logger.info(f"Model class names: {self.model.names}")

    def predict(self, image_path: str):
        """
        Run inference on a single image.

        Returns the raw ultralytics Results object (first element,
        since we only pass one image at a time).
        """
        results = self.model.predict(
            source=image_path,
            imgsz=IMG_SIZE,
            conf=CONF_THRESHOLD,
            iou=IOU_THRESHOLD,
            device=DEVICE,
            verbose=False,
        )
        return results[0]

    def parse_detections(self, result):
        """
        Convert ultralytics Results into a clean list of dicts:
        [{class_id, class_name, confidence, bbox: [x1,y1,x2,y2]}, ...]
        """
        detections = []
        boxes = result.boxes

        if boxes is None or len(boxes) == 0:
            return detections

        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]

            det = {
                "classId": cls_id,
                "class_id": cls_id,
                "className": CLASS_NAMES.get(cls_id, f"class_{cls_id}"),
                "class_name": CLASS_NAMES.get(cls_id, f"class_{cls_id}"),
                "confidence": round(conf, 4),
                "bbox": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2),
                },
            }
            detections.append(det)

        # Sort by confidence, highest first
        detections.sort(key=lambda d: d["confidence"], reverse=True)
        return detections


# Module-level singleton — imported by routes so the model loads only once
dental_model = DentalYOLOModel()