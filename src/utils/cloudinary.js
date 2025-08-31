import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been successfully uploaded
        // console.log("file has been uploaded on cloudinary successfully" , response.url)
        fs.unlinkSync(localFilePath);
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved 
        //temporary file as the upload operation got failed
        return null
    }
}

const deleteFromCloudinary = async (cloudinaryUrl, resourceType) => {
    try {
        if (!cloudinaryUrl) {
            console.log("No Cloudinary URL provided.");
            return null;
        }
        
        const publicId = cloudinaryUrl.split('/').pop().split('.')[0];

        // 2. Call Cloudinary's destroy method
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType  // This will be 'video' or 'image'
        });
        
        console.log("Asset deletion result from Cloudinary:", result);
        return result;

    } catch (error) {
        console.error("Error deleting asset from Cloudinary:", error);
        return null; // Return null on failure
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}