"""
FastAPI entrypoint for the Dental Disease Detection AI Service.

Run locally:
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"""
import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import predict
from app.config import RESULT_DIR

os.makedirs(RESULT_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(
    title="Dental Disease Detection AI Service",
    description="YOLOv8-powered panoramic X-ray analysis for dental conditions",
    version="1.0.0",
)

# CORS: only the Node.js backend should call this service directly.
# Restrict this in production to your backend's URL/IP.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict to Node backend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve annotated result images statically so the Node backend can
# fetch them and re-upload to Cloudinary
app.mount("/static/results", StaticFiles(directory=RESULT_DIR), name="results")

app.include_router(predict.router, tags=["Detection"])


@app.get("/")
async def root():
    return {
        "service": "Dental Disease Detection AI Service",
        "status": "running",
        "docs": "/docs",
    }