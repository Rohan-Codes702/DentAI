"""
Utilities for annotating X-ray images with detection results
and building a summary the dentist/report can use.
"""
import os
import uuid
import cv2

from app.config import CLASS_COLORS, URGENT_CLASSES, RESULT_DIR


def annotate_image(image_path: str, detections: list) -> str:
    """
    Draw bounding boxes + labels on the original X-ray.
    Returns the path to the saved annotated image.
    """
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image at {image_path}")

    for det in detections:
        x1, y1 = int(det["bbox"]["x1"]), int(det["bbox"]["y1"])
        x2, y2 = int(det["bbox"]["x2"]), int(det["bbox"]["y2"])
        color = CLASS_COLORS.get(det["class_id"], (0, 255, 0))
        label = f'{det["class_name"]} {det["confidence"] * 100:.1f}%'

        # Box
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

        # Label background
        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(image, (x1, y1 - text_h - 8), (x1 + text_w + 4, y1), color, -1)

        # Label text (white for contrast)
        cv2.putText(
            image, label, (x1 + 2, y1 - 4),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA
        )

    os.makedirs(RESULT_DIR, exist_ok=True)
    result_filename = f"{uuid.uuid4().hex}_annotated.jpg"
    result_path = os.path.join(RESULT_DIR, result_filename)
    cv2.imwrite(result_path, image)

    return result_path


def build_summary(detections: list) -> dict:
    """
    Build a human-readable summary from raw detections:
    - total findings
    - counts per condition
    - urgent findings flagged separately
    - overall average confidence
    """
    if not detections:
        return {
            "totalFindings": 0,
            "conditionsFound": [],
            "urgentFindings": [],
            "averageConfidence": 0.0,
        }

    condition_counts = {}
    urgent = []
    total_conf = 0.0

    for det in detections:
        name = det["className"]
        condition_counts[name] = condition_counts.get(name, 0) + 1
        total_conf += det["confidence"]

        if det["classId"] in URGENT_CLASSES:
            urgent.append({
                "condition": name,
                "confidence": det["confidence"],
            })

    return {
        "totalFindings": len(detections),
        "conditionsFound": [
            {"condition": name, "count": count}
            for name, count in condition_counts.items()
        ],
        "urgentFindings": urgent,
        "averageConfidence": round(total_conf / len(detections), 4),
    }