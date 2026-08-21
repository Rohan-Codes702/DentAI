"""
POST /predict
Accepts a panoramic X-ray image, runs YOLOv8 inference, returns:
  - list of detections (class, confidence, bbox)
  - a summary (counts, urgent findings, avg confidence)
  - the annotated image (served as a static file URL)

This is the contract the Node.js backend will call after the
dentist uploads an X-ray.
"""
import os
import uuid
import shutil
import logging

from fastapi import APIRouter, UploadFile, File, Header, HTTPException

from app.config import UPLOAD_DIR, AI_SERVICE_API_KEY
from app.models.yolo_model import dental_model
from app.utils.image_utils import annotate_image, build_summary

logger = logging.getLogger("dental_ai.predict")
router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}
MAX_FILE_SIZE_MB = 15


def verify_api_key(x_api_key: str | None):
    """Simple shared-secret check so this service isn't callable by anyone."""
    if x_api_key != AI_SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    x_api_key: str | None = Header(default=None, alias="x-api-key"),
):
    verify_api_key(x_api_key)

    # --- Validate file type ---
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    # --- Save uploaded file temporarily ---
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    temp_filename = f"{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Basic size check
        size_mb = os.path.getsize(temp_path) / (1024 * 1024)
        if size_mb > MAX_FILE_SIZE_MB:
            raise HTTPException(status_code=400, detail="File too large (max 15MB)")

        # --- Run inference ---
        logger.info(f"Running inference on {temp_path}")
        result = dental_model.predict(temp_path)
        detections = dental_model.parse_detections(result)

        # --- Annotate image ---
        annotated_path = annotate_image(temp_path, detections)
        annotated_filename = os.path.basename(annotated_path)

        # --- Build summary ---
        summary = build_summary(detections)

        return {
            "success": True,
            "detections": detections,
            "summary": summary,
            # Node backend fetches this from AI_SERVICE_URL + this path,
            # then re-uploads it to Cloudinary for permanent storage.
            "annotated_image_path": f"/static/results/{annotated_filename}",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    finally:
        # Clean up the original temp upload (keep only the annotated result)
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/health")
async def health_check():
    return {"status": "ok", "model_loaded": dental_model.model is not None}