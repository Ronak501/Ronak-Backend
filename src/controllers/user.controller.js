import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
     const {username, email, fullname, password} = req.body
     console.log("email:", email);

     if(
          [username,fullname,email,password].some(() => 
               field?.trim() ==="")
     ){
          throw new ApiError(400, "All fields is required")
     } 

     const existedUser = User.findOne({
          $or: [{username}, {email}]
     })

     if(existedUser){
          throw new ApiError(409, "User with email or username already exists")
     }

     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath =  req.files?.coverImage[0]?.path;

     if(!avatarLocalPath){
          throw new ApiError(400,"Avatar File is required")
     }

     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocal.path)

     if(!avatar){
          throw new ApiError(400,"Avatar File is required")
     }

     User.creat({
          fullName,
          avatar: avatar.url,
          coverImage: coverImage?.url ||"",
          email,
          password,
          username: username.toLowerCase()
     })

     const createdUser = await User.findById(user._id).select(
          "-password -refreshToken"
     )

     if(!createdUser){
          throw new ApiError(500,"Something went wrong while registering the user.");
     }

     return res.status(201).json(
          new ApiResponse(200, createdUser, "Created User Successfully")
     )
})

export {registerUser}