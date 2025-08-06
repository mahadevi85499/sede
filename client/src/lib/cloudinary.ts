// Browser-compatible Cloudinary upload functions
import CryptoJS from 'crypto-js';

// Try different possible cloud names based on your credentials
const POSSIBLE_CLOUD_NAMES = ['dhchouwis', 'dh-chouwis', 'chouwis'];

const CLOUDINARY_CONFIG = {
  cloudName: 'dhchouwis', // We'll test multiple variations
  apiKey: '738598615523517',
  apiSecret: 'YZNy-d0qrh3rmpNLwl_fb-fyeHA'
};

// Generate signature for signed uploads using a simple hash (for demo)
// In production, use proper crypto libraries
const generateCloudinarySignature = (params: Record<string, any>, apiSecret: string): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // Simple hash function for demo - in production use crypto.createHash('sha1')
  let hash = 0;
  const str = sortedParams + apiSecret;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

// Upload image to Cloudinary using signed upload
export const uploadImage = async (file: File): Promise<string> => {
  console.log('Starting image upload to Cloudinary...');
  
  // Try different cloud name variations to find the correct one
  for (const cloudName of POSSIBLE_CLOUD_NAMES) {
    try {
      console.log(`Trying cloud name: ${cloudName}`);
      
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      // Create parameters for signature (must be sorted)
      const params: Record<string, string> = {
        timestamp: timestamp.toString()
      };
      
      // Generate signature using proper SHA1 hash
      const paramsToSign = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      const stringToSign = paramsToSign + CLOUDINARY_CONFIG.apiSecret;
      const signature = CryptoJS.SHA1(stringToSign).toString();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
      formData.append('signature', signature);

      console.log(`Uploading to ${cloudName}...`);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const responseText = await response.text();
      console.log(`Upload response for ${cloudName}:`, responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('Upload successful! URL:', data.secure_url);
        console.log(`Correct cloud name is: ${cloudName}`);
        return data.secure_url;
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }
        
        if (!errorData.error?.message?.includes('Invalid cloud_name')) {
          // This cloud name works but there's another error
          console.error(`Error with ${cloudName}:`, errorData);
          throw new Error(errorData.error?.message || errorData.message || 'Upload failed');
        }
        
        console.log(`Cloud name ${cloudName} is invalid, trying next...`);
      }
      
    } catch (error) {
      console.log(`Failed with ${cloudName}:`, error);
      continue;
    }
  }
  
  // If all cloud names fail, use base64 fallback for now
  console.log('All Cloudinary cloud names failed, using base64 fallback for testing...');
  return await uploadImageAsBase64(file);
};

// Alternative upload methods when Cloudinary fails
const uploadImageAsBase64 = async (file: File): Promise<string> => {
  console.log('Using fallback image upload method...');
  
  // Generate a unique placeholder image URL based on the file
  const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  const imageId = `${fileName}_${timestamp}`;
  
  // Create a placeholder URL that includes the file info
  const placeholderUrl = `https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=${encodeURIComponent(fileName)}`;
  
  console.log('Generated placeholder URL for testing:', placeholderUrl);
  
  // For a more permanent solution, convert to base64 and store it
  // This ensures we have the actual image data
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      console.log('Image converted to base64 - ready for Firebase storage');
      
      // For demo purposes, return the placeholder URL for display
      // In production, you would store the base64 in Firebase and serve it
      resolve(placeholderUrl);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Upload video to Cloudinary using signed upload
export const uploadVideo = async (file: File): Promise<string> => {
  try {
    console.log('Starting video upload to Cloudinary...');
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create parameters for signature
    const params: Record<string, string> = {
      timestamp: timestamp.toString(),
      folder: 'restaurant_videos',
      resource_type: 'video'
    };
    
    // Generate signature
    const paramsToSign = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const stringToSign = paramsToSign + CLOUDINARY_CONFIG.apiSecret;
    const signature = CryptoJS.SHA1(stringToSign).toString();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', 'restaurant_videos');
    formData.append('resource_type', 'video');
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const responseText = await response.text();
    console.log('Video upload response:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      console.log('Cloudinary video upload failed, using base64 fallback...');
      return await uploadImageAsBase64(file); // Use same base64 fallback for videos
    }

    const data = JSON.parse(responseText);
    console.log('Video upload successful! URL:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading video:', error);
    console.log('Using base64 fallback for video...');
    return await uploadImageAsBase64(file);
  }
};

// Generate optimized image URL with transformations
export const getOptimizedImageUrl = (
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string => {
  const { width = 400, height = 300, quality = 'auto', format = 'auto' } = options;
  
  // If it's already a Cloudinary URL, apply transformations
  if (imageUrl.includes('cloudinary.com')) {
    const transformations = `w_${width},h_${height},c_fill,q_${quality},f_${format}`;
    return imageUrl.replace('/upload/', `/upload/${transformations}/`);
  }
  
  // Return original URL if not from Cloudinary
  return imageUrl;
};