const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const logger = require('./logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || 'change-this-secret-key';

/**
 * Sends a local X-ray image file to the FastAPI YOLOv8 service and
 * returns detections + summary + annotated image path.
 *
 * @param {string} filePath - local path of the uploaded X-ray
 * @returns {Promise<{success:boolean, detections:Array, summary:Object, annotated_image_path:string}>}
 */
const analyzeXray = async (filePath) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, form, {
      headers: {
        ...form.getHeaders(),
        'x-api-key': AI_SERVICE_API_KEY,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000, // model inference can take a few seconds
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      logger.error('AI service error response:', error.response.status, error.response.data);
      throw new Error(
        `AI service returned ${error.response.status}: ${
          error.response.data?.detail || 'prediction failed'
        }`
      );
    }
    logger.error('AI service unreachable:', error.message);
    throw new Error('AI service is unreachable. Is the FastAPI server running?');
  }
};

/**
 * Builds a full, fetchable URL for the annotated image returned by the AI service
 * (annotated_image_path is a relative static path like /static/results/xxx.jpg).
 */
const getAnnotatedImageUrl = (annotatedImagePath) => {
  if (!annotatedImagePath) return null;
  return `${AI_SERVICE_URL}${annotatedImagePath}`;
};

module.exports = { analyzeXray, getAnnotatedImageUrl };
