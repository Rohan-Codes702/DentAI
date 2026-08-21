"""
Central configuration for the Dental Disease Detection AI Service.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# -------------------------------------------------------------------
# Model
# -------------------------------------------------------------------
# Place your trained weights at: ai-service/app/weights/best.pt
# Or override with an env var (useful for Docker / deployment)
MODEL_PATH = os.getenv("MODEL_PATH", "app/weights/best.pt")

# Image size the model was trained on (YOLOv8 default is 640)
IMG_SIZE = int(os.getenv("IMG_SIZE", 640))

# Minimum confidence to keep a detection (tune based on validation results)
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", 0.70))

# IoU threshold for Non-Max Suppression
IOU_THRESHOLD = float(os.getenv("IOU_THRESHOLD", 0.45))

# Device: "cuda" if you have a GPU available, otherwise "cpu"
DEVICE = os.getenv("DEVICE", "cpu")



# -------------------------------------------------------------------
# Class names (must match the order used during training)
# -------------------------------------------------------------------
CLASS_NAMES = {
    0: "Caries",
    1: "Crown",
    2: "Filling",
    3: "Implant",
    4: "Missing teeth",
    5: "Periapical lesion",
    6: "Root Canal Treatment",
    7: "Root Piece",
    8: "Impacted tooth",
    9: "Bone Loss",
}

# Color per class for annotation (BGR, used by OpenCV) — feel free to restyle
CLASS_COLORS = {
    0: (0, 0, 255),      # Caries - red (urgent)
    1: (255, 191, 0),    # Crown - blue
    2: (0, 255, 255),    # Filling - yellow
    3: (255, 0, 255),    # Implant - magenta
    4: (128, 128, 128),  # Missing teeth - gray
    5: (0, 0, 200),      # Periapical lesion - dark red (urgent)
    6: (255, 165, 0),    # Root Canal Treatment - orange
    7: (0, 165, 255),    # Root Piece - orange-ish
    8: (0, 255, 0),      # Impacted tooth - green
    9: (203, 192, 255),  # Bone Loss - pink
}

# Which findings should be flagged as "urgent" for the dentist
URGENT_CLASSES = {0, 5, 8, 9}  # Caries, Periapical lesion, Impacted tooth, Bone loss

# -------------------------------------------------------------------
# Storage (where annotated result images are temporarily saved
# before being uploaded to Cloudinary by the Node backend, or served
# directly from here)
# -------------------------------------------------------------------
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "app/static/uploads")
RESULT_DIR = os.getenv("RESULT_DIR", "app/static/results")

# -------------------------------------------------------------------
# API security (shared secret between Node backend <-> AI service,
# since this service should never be exposed directly to the internet)
# -------------------------------------------------------------------
AI_SERVICE_API_KEY = os.getenv("AI_SERVICE_API_KEY", "change-this-secret-key")