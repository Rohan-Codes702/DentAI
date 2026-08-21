import os
from pathlib import Path
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()

# compute default data path relative to repository root
ROOT = Path(__file__).resolve().parent.parent
DATA_YAML_DEFAULT = str(ROOT / "data" / "data.yaml")
DATA_YAML = os.getenv("DATA_YAML", DATA_YAML_DEFAULT)
PROJECT = os.getenv("PROJECT", str(ROOT / "runs"))
NAME    = os.getenv("NAME", "dental_model")

def validate():
    weights = os.path.join(PROJECT, NAME, "weights", "best.pt")

    if not os.path.exists(weights):
        print(f"❌ Weights not found at: {weights}")
        return

    model = YOLO(weights)

    metrics = model.val(data=DATA_YAML)

    print("\n📊 Validation Results:")
    print(f"  mAP50     : {metrics.box.map50:.4f}")
    print(f"  mAP50-95  : {metrics.box.map:.4f}")
    print(f"  Precision : {metrics.box.mp:.4f}")
    print(f"  Recall    : {metrics.box.mr:.4f}")

if __name__ == "__main__":
    validate()