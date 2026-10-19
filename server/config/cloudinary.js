const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 */
const uploadToCloudinary = async (filePath, folder = 'dentai/misc', options = {}) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    type: options.type || 'upload',
  });

  return {
    url: options.type === 'authenticated'
      ? cloudinary.url(result.public_id, {
          resource_type: 'image',
          type: 'authenticated',
          sign_url: true,
          secure: true,
        })
      : result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Upload PDF/raw files to Cloudinary
 */
const uploadRawToCloudinary = async (
  filePath,
  folder = 'dentai/reports',
  options = {}
) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'raw',
    type: options.type || 'upload',
    ...(options.type === 'authenticated' ? {} : { access_mode: 'public' }),
  });

  return {
    url: options.type === 'authenticated'
      ? cloudinary.url(result.public_id, {
          resource_type: 'raw',
          type: 'authenticated',
          sign_url: true,
          secure: true,
        })
      : result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Delete a Cloudinary asset
 */
const deleteFromCloudinary = async (
  publicId,
  resourceType = 'image'
) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadRawToCloudinary,
  deleteFromCloudinary,
};