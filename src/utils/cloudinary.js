import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
       
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEYS, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
     try{
          if(!localFilePath) return null
          //upload the file on cloudinary
          const response = await cloudinary.uploader.upload(localFilePath,{
               resource_type: "auto"
          })
          //file has been uploaded successfull
          console.log("file is uploaded on cloudinary",response.url);
          return response;
     }    catch(error){
          fs.unlinkSync(localFilePath)
          //remove file from server
          return null;
     }
}

export {uploadOnCloudinary};