from ultralytics import YOLO
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

# Compute paths relative to repository root
ROOT = Path(__file__).resolve().parent.parent
PROJECT = os.getenv("PROJECT", str(ROOT / "runs"))
NAME = os.getenv("NAME", "dental_model")
WEIGHTS_PATH = str(Path(PROJECT) / NAME / "weights" / "best.pt")

# Load your trained YOLOv8 model
model = YOLO(WEIGHTS_PATH)

# Export to ONNX (simplify and image size optional)
model.export(
    format="onnx", 
    opset=19, 
    imgsz=512, 
    simplify=True
)

print("✅ Export complete! ONNX model saved in the same folder as your .pt file.")
print(f"📁 Model path used: {WEIGHTS_PATH}")