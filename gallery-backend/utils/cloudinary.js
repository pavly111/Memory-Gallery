// utils/cloudinary.js
// Server-side Cloudinary config — used only for authenticated operations
// like deleting an asset. This is separate from the unsigned upload preset
// ("images") the Angular frontend uses to upload directly from the browser;
// that preset never touches this file or the server at all.

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;