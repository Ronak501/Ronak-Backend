import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userId) => {
     try{
          const user = await User.findById(userId)
          const accessToken = user.generateAccessToken()
          const refreshToken = user.generateRefreshToken()

          user.refreshToken = refreshToken
          await user.save({ValidateBeforeSave: false})

          return{accessToken, refreshToken}

     } catch (error) {
          throw new ApiError(500, "Something went wrong while generating access token")
     }
}

const registerUser = asyncHandler( async (req, res) => {
     const {username, email, fullName, password} = req.body
     //console.log(req.body)

     if(
          [username,fullName,email,password].some((field) => field?.trim() ==="")
     ){
          throw new ApiError(400, "All fields is required")
     } 

     const existedUser = await User.findOne({
          $or: [{username}, {email}]
     })

     if(existedUser){
          throw new ApiError(409, "User with email or username already exists")
     }

     //console.log(req.files);
     const avatarLocalPath = req.files?.avatar[0]?.path;
     //const coverImageLocalPath =  req.files?.coverImage[0]?.path;

     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
          coverImageLocalPath = req.files?.coverImage[0]?.path;
     }

     if(!avatarLocalPath){
          throw new ApiError(400,"Avatar File is required")
     }

     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if(!avatar){
          throw new ApiError(400,"Avatar File is required")
     }

     const user = await User.create({
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

const loginUser = asyncHandler( async (req, res) => {
     const {email, username, password} =req.body
     if(!username || !email){
          throw new ApiError(400,"username or password is required")
     }

     const user = await User.findOne({
          $or:[{username},{email}]
     })

     if(!user){
          throw new ApiError(404,"User does not exist")
     }

     const isPasswordVaild =  await user.isPasswordCorrect(password)

     if(!isPasswordVaild){
          throw new ApiError(401,"invalid user credentials")
     }

     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

     const loggedInUser = await User.findbyId(user._id).select("-password -refreshToken")
     
     const options = {
          httpOnly: true,
          secure: true
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
          new ApiResponse(
               200,
               {
                    user:loggedInUser, accessToken, refreshToken
               },
               "User logged in successfully"
          )
     )
})

const logoutUser = asyncHandler(async(req, res) => {
     await User.findByAndUpdate(
          req.user._id,
          {
               $set:{
                    refreshToken: undefined
               }
          },
          {
               new: time
          }
     )     

     const options = {
          httpOnly: true,
          secure: true
     }

     return res
     .status(200)
     .clearcookie("accessToken", options)
     .clearcookie("refreshToken", options)
     .json(new ApiResponse(200,{},"User logged Out"))
})

export {registerUser,loginUser,logoutUser}
