from ultralytics import YOLO
import cv2
import sys
import os
import time
from pathlib import Path

from severity import calculate_area, get_severity
from treatment import suggest_treatment
from tooth_numbering import assign_tooth_number
from report import generate_report


# Compute paths relative to repository root
ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = str(ROOT / "models" / "best.pt")
DEFAULT_IMAGE_PATH = str(ROOT / "data" / "test" / "images" / "test1.jpg")
OUTPUT_FOLDER = str(ROOT / "outputs" / "predict")

# Load trained YOLO model
model = YOLO(MODEL_PATH)


# Get image path from terminal argument
image_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_IMAGE_PATH


# Read image
image = cv2.imread(image_path)

if image is None:
    print(f"❌ Image not found: {image_path}")
    exit()

image_width = image.shape[1]


# Run detection with confidence and IoU threshold
results = model(image_path, conf=0.6, iou=0.4)


detections = []


# Process detections
for r in results:

    boxes = r.boxes.xyxy
    confs = r.boxes.conf
    classes = r.boxes.cls

    for box, conf, cls in zip(boxes, confs, classes):

        # Skip low confidence predictions
        if conf < 0.6:
            continue

        x1, y1, x2, y2 = box.tolist()

        # Calculate detected area
        area = calculate_area([x1, y1, x2, y2])

        # Determine severity
        severity = get_severity(area, conf)

        # Disease name from model class
        disease = model.names[int(cls)]

        # Suggest treatment
        treatment = suggest_treatment(disease)

        # Assign tooth number
        tooth_number = assign_tooth_number([x1, y1, x2, y2], image_width)

        # Store detection info
        detections.append({
            "tooth": tooth_number,
            "disease": disease,
            "severity": severity,
            "confidence": round(float(conf) * 100, 2),
            "treatment": treatment
        })


# Generate doctor report
generate_report(detections, role="doctor")


# Draw prediction boxes on image
annotated = results[0].plot()


# Create output folder if not exists
os.makedirs(OUTPUT_FOLDER, exist_ok=True)


# Get image name without extension
name = os.path.splitext(os.path.basename(image_path))[0]


# Create unique timestamp
timestamp = int(time.time())


# Save annotated image
save_path = f"{OUTPUT_FOLDER}/{name}_{timestamp}.jpg"

cv2.imwrite(save_path, annotated)


print("\n✅ Detection Completed")
print(f"📁 Annotated image saved at: {save_path}")