import os
from pathlib import Path
from dotenv import load_dotenv
from ultralytics import YOLO

# Load .env
load_dotenv()
ROOT = Path(__file__).resolve().parent.parent

DATA_YAML_DEFAULT = str(ROOT / "data" / "data.yaml")

# Params from .env
DATA_YAML = os.getenv("DATA_YAML", DATA_YAML_DEFAULT)
MODEL     = os.getenv("MODEL", "yolov8m.pt")
EPOCHS    = int(os.getenv("EPOCHS", 100))
BATCH     = int(os.getenv("BATCH", 8))
IMGSZ     = int(os.getenv("IMGSZ", 640))
DEVICE    = os.getenv("DEVICE", "0")
PROJECT   = os.getenv("PROJECT", str(ROOT / "runs"))
NAME      = os.getenv("NAME", "dental_model")
AUGMENT   = os.getenv("AUGMENT", "True").lower() in ("true", "1", "yes")

CLASS_NAMES = [
    "Caries", "Crown", "Filling", "Implant", "Missing teeth",
    "Periapical lesion", "Root Canal Treatment", "Root Piece",
    "impacted tooth", "Bone Loss"
]

# Path to checkpoint
CKPT_PATH = Path(PROJECT) / NAME / "weights" / "last.pt"

def train():
    print("=" * 50)
    print(f"Model      : {MODEL}")
    print(f"Dataset    : {DATA_YAML}")
    print(f"Epochs     : {EPOCHS}")
    print(f"Batch      : {BATCH}")
    print(f"Image Size : {IMGSZ}")
    print(f"Device     : {DEVICE}")
    print(f"Augment    : {AUGMENT}")
    print(f"Resume ckpt: {CKPT_PATH if CKPT_PATH.exists() else 'None'}")
    print("=" * 50)

    model = YOLO(MODEL)

    # Update number of classes
    if hasattr(model.model, "model"):
        model.model.model[-1].nc = len(CLASS_NAMES)
        model.model.model[-1].names = CLASS_NAMES

    # Determine if we can resume
    resume_ckpt = str(CKPT_PATH) if CKPT_PATH.exists() else None

    # Train
    results = model.train(
        data=DATA_YAML,
        epochs=EPOCHS,
        batch=BATCH,
        imgsz=IMGSZ,
        device=DEVICE,
        project=PROJECT,
        name=NAME,
        save=True,
        save_period=10,
        val=True,
        plots=True,
        verbose=True,
        exist_ok=True,
        augment=AUGMENT,
        resume=resume_ckpt
    )

    print("\n✅ Training Complete!")
    print(f"Best weights saved at: {PROJECT}/{NAME}/weights/best.pt")
    return results

if __name__ == "__main__":
    train()