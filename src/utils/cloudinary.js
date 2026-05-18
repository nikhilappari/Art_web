/**
 * Uploads a file (File object, Blob, or Base64 string) to Cloudinary using unsigned uploads.
 * @param {File|Blob|string} file - The file to upload.
 * @param {string} cloudName - Cloudinary Cloud Name.
 * @param {string} uploadPreset - Cloudinary Upload Preset (must be set to Unsigned).
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (file, cloudName, uploadPreset) => {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary Cloud Name and Upload Preset are required.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url;
};
