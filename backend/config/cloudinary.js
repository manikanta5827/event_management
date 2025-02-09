import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryImageUpload = async (image, folder) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: folder,
        });
        return uploadResponse.secure_url;
    } catch (error) {
        throw new Error('Error uploading image to Cloudinary');
    }
}
export default cloudinaryImageUpload; 