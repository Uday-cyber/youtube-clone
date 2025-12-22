import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "./ApiError.js";

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
);

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return console.log('Could not find the file path');
        
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        // console.log('File uploaded successfully on cloudinary', response.url);
        // console.log("Response: ", response);
        fs.unlinkSync(localFilePath);
        
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation got failed.
        return null;
    }
}

export const deleteFromCloudinary = async (public_id) => {
    try {
        if(!public_id) throw new ApiError(400, "Could not find public id to delete from cloudinary");
    
        const response = await cloudinary.uploader.destroy(public_id, { resource_type: "image", invalidate:true });    

        return response;
    } catch (error) {
        throw error;
    }
}