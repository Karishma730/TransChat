import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export const uploadMedia = async (
  file: File,
  userId: string,
  chatId: string
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${userId}/${chatId}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};

export const validateMediaFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024;
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 100MB' };
  }

  const isImage = allowedImageTypes.includes(file.type);
  const isVideo = allowedVideoTypes.includes(file.type);
  const isFile = allowedFileTypes.includes(file.type);

  if (!isImage && !isVideo && !isFile) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
};

export const getMediaType = (file: File): 'image' | 'video' | 'file' => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  if (allowedImageTypes.includes(file.type)) return 'image';
  if (allowedVideoTypes.includes(file.type)) return 'video';
  return 'file';
};
