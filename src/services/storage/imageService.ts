import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type UploadResult,
} from 'firebase/storage';
import { storage } from '../../config/firebase';
import { STORAGE_PATHS } from '../../types/firebase';
import { logger } from '../../utils/logger';

const IMAGE_VALIDATION = {
  maxSizeBytes: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

const compressImage = async (file: File, maxWidth = 1200, maxHeight = 1200): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const validateImage = (file: File): void => {
  if (file.size === 0) {
    throw new Error('File is empty');
  }

  if (!IMAGE_VALIDATION.allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > IMAGE_VALIDATION.maxSizeBytes) {
    throw new Error('File too large');
  }
};

export const uploadProfilePhoto = async (userId: string, file: File): Promise<string> => {
  validateImage(file);

  try {
    const compressedImage = await compressImage(file, 800, 800);

    const randomSuffix =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const fileName = `${Date.now()}-${randomSuffix}.jpg`;
    const storageRef = ref(storage, `${STORAGE_PATHS.PROFILE_PHOTOS}/${userId}/${fileName}`);

    const snapshot: UploadResult = await uploadBytes(storageRef, compressedImage);

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    logger.error('Error uploading profile photo:', error);
    const wrapped = new Error('Failed to upload profile photo');
    (wrapped as { cause?: unknown }).cause = error;
    throw wrapped;
  }
};

export const uploadListingImage = async (userId: string, file: File): Promise<string> => {
  validateImage(file);

  try {
    const compressedImage = await compressImage(file, 1200, 1200);

    const randomSuffix =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const fileName = `${Date.now()}-${randomSuffix}.jpg`;
    const storageRef = ref(storage, `${STORAGE_PATHS.LISTING_IMAGES}/${userId}/${fileName}`);

    const snapshot: UploadResult = await uploadBytes(storageRef, compressedImage);

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    logger.error('Error uploading listing image:', error);
    const wrapped = new Error('Failed to upload listing image');
    (wrapped as { cause?: unknown }).cause = error;
    throw wrapped;
  }
};

export const deleteImage = async (imageURL: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageURL);
    await deleteObject(imageRef);
  } catch (error) {
    logger.error('Error deleting image:', error);
  }
};

export const getPlaceholderImageURL = (seed: string): string => {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`;
};
