// Image upload utilities for Supabase-based Restaurant Operating System

// Upload image using base64 data URL (Supabase-compatible approach)
export const uploadImage = async (file: File): Promise<string> => {
  console.log('Starting image upload...');
  
  // Since we're using Supabase instead of Cloudinary, convert to base64 data URL
  return await uploadImageAsBase64(file);
};

// Convert image to base64 data URL with compression for better performance
const uploadImageAsBase64 = async (file: File): Promise<string> => {
  console.log('Using base64 image upload method...');
  
  return new Promise((resolve, reject) => {
    // Create a canvas to resize/compress the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set maximum dimensions
      const maxWidth = 800;
      const maxHeight = 600;
      
      let { width, height } = img;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress the image
      ctx!.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
      
      console.log('Image converted to compressed base64 data URL');
      console.log('Image upload successful:', compressedDataUrl.substring(0, 50) + '...');
      
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to process image'));
    
    // Convert file to data URL for the image element
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
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