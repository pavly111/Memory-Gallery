// utils/deleteCloudinaryImage.js
// Deletes an asset from Cloudinary by its public_id. Used when a photo is
// removed from the gallery, so the Mongo record and the actual stored image
// stay in sync instead of leaving orphaned files in Cloudinary.

const cloudinary = require('./cloudinary');

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return; // nothing to do — photo may predate publicId being tracked

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Log but don't throw — a failed Cloudinary cleanup shouldn't block the
    // Mongo delete from succeeding. Worst case is a harmless orphaned asset,
    // not a broken request.
    console.error('Cloudinary delete failed for', publicId, err);
  }
};

module.exports = deleteCloudinaryImage;