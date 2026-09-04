import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables for Cloudinary
dotenv.config({ path: '.env.local' });
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VIDEOS_DIR = path.join(__dirname, '../public/marketing/videos');
const BASE_FOLDER = 'accurate-medical';

async function uploadVideo(filePath: string, folder: string, publicId: string) {
  try {
    console.log(`Uploading ${filePath} to ${folder}/${publicId}...`);
    const result = await cloudinary.uploader.upload_large(filePath, {
      resource_type: 'video',
      folder: folder,
      public_id: publicId,
      overwrite: true,
      eager: [
        { format: 'mp4', video_codec: 'auto' },
        { format: 'webm', video_codec: 'auto' }
      ],
      eager_async: true
    });
    console.log(`✅ Uploaded successfully!`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error);
    throw error;
  }
}

async function run() {
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing CLOUDINARY_API_SECRET in environment variables.");
    process.exit(1);
  }

  console.log("Starting video migration to Cloudinary...");
  const dirs = fs.readdirSync(VIDEOS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const dir of dirs) {
    const dirPath = path.join(VIDEOS_DIR, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mp4'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      // Determine publicId from directory name for consistency
      const publicId = dir;
      
      await uploadVideo(filePath, BASE_FOLDER, publicId);
    }
  }

  console.log("🎉 All videos migrated successfully!");
  console.log("Please update src/config/media.ts with any new public IDs if they changed.");
}

run().catch(console.error);
