// Image upload utilities for Supabase-based Restaurant Operating System

// Upload image using base64 data URL (Supabase-compatible approach)
export const uploadImage = async (file: File): Promise<string> => {
  console.log('Starting image upload...');
  
  // Since we're using Supabase instead of Cloudinary, convert to base64 data URL
  return await uploadImageAsBase64(file);
};

// Convert image to base64 data URL for direct storage
const uploadImageAsBase64 = async (file: File): Promise<string> => {
  console.log('Using base64 image upload method...');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      console.log('Image converted to base64 data URL');
      console.log('Image upload successful:', base64String.substring(0, 50) + '...');
      
      // Return the base64 data URL for direct use
      resolve(base64String);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Upload video using base64 data URL
export const uploadVideo = async (file: File): Promise<string> => {
  try {
    console.log('Starting video upload...');
    
    // For videos, we'll also use base64 conversion
    return await uploadImageAsBase64(file);
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error('Failed to upload video');
  }
};

// Since we're using base64 data URLs, no optimization needed
export const getOptimizedImageUrl = (imageUrl: string): string => {
  // Return the original data URL as-is
  return imageUrl;
};