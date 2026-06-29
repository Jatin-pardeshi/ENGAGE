import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import imageCompression from 'browser-image-compression';

/**
 * Compresses an image and uploads it to Firebase Storage.
 * Designed for low-quality uploads to manage storage effectively.
 */
export const compressAndUploadImage = async (file, path = 'uploads') => {
  if (!file) return null;

  try {
    // 1. Check File Type and Compress if Image
    let fileToUpload = file;
    const isImage = file.type.startsWith('image/');
    
    if (isImage) {
      const options = {
        maxSizeMB: 0.2, // Max 200KB
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.6
      };
      console.log(`Original image size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      fileToUpload = await imageCompression(file, options);
      console.log(`Compressed image size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log(`Uploading video/other file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      // Warning: In production, you'd want to enforce a hard size limit here (e.g. 15MB)
      if (file.size > 15 * 1024 * 1024) {
        throw new Error("File too large. Max 15MB.");
      }
    }

    // 2. Upload to Firebase Storage
    const storageRef = ref(storage, `${path}/${Date.now()}_${fileToUpload.name}`);
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    
    // 3. Get URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;

  } catch (error) {
    console.error("Error compressing/uploading image:", error);
    throw error;
  }
};
