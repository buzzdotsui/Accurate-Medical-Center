const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'hefhxm1l',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const filePath = "C:\\Users\\USER\\Accurate Medical Center\\public\\marketing\\videos\\consultation-slideshow-trimmed.mp4";

console.log("Uploading trimmed video (HEVC, <100MB) via upload_large...");

cloudinary.uploader.upload_large(filePath, {
  resource_type: "video",
  public_id: "accurate-medical/consultation-slideshow",
  overwrite: true,
  chunk_size: 6 * 1024 * 1024 // 6MB chunks
}, (error, result) => {
  if (error) {
    console.error("Upload error:", JSON.stringify(error, null, 2));
    process.exit(1);
  }
  console.log("Upload successful!");
  console.log("URL:", result.secure_url);
  console.log("Public ID:", result.public_id);
});
