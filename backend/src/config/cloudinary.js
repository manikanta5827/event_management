import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/errorHandler.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const cloudinaryImageUpload = async (imageString, folder = 'event_management') => {
    try {
        // If no image is provided, return null
        if (!imageString) return null;

        // Check if the image is already a URL (for updates where image hasn't changed)
        if (imageString.startsWith('http')) {
            return imageString;
        }

        // Upload image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(imageString, {
            resource_type: 'auto',
            folder: folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        return uploadResponse.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        if (error.http_code === 400) {
            throw new AppError('Invalid image format or size. Please try again with a different image.', 400);
        }
        throw new AppError('Image upload failed. Please try again.', 500);
    }
};

export const cloudinaryImageDelete = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        // Extract public_id from the URL
        const publicId = `${imageUrl.split('/').slice(-2)[0]}/${imageUrl.split('/').slice(-1)[0].split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
        // Don't throw error for deletion failures
    }
};