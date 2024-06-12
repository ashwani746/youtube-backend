
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import{uploadOnCloudinary} from  "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler( async (req, res) => {
   // get user details from frontend
   // validation email correct - not empty 
   // check if user already exits: username, email
   // check for images, check for avatar
   // upload then to cloudinary, then succesfully upload avatar
   // create user object - send to data mongodb , nosql data .make obejct ....create entry in db
   //remove password and refresh token field from response
   // check for user creation 
   // return res

   const{fullName,email,username,password}=req.body
   console.log("email: ",email);
   
// one by one check process validation
//    if (fullName ===""){
//        throw new ApiError(400,"full name is required")   
//    }

    if (
        [fullName,email,username,password].some((field)=>
        field?.trim() ==="")
    ){
        throw new ApiError(400,"All fields are required") 
    }

    // User call the mongodb
    const exitedUser=User.findOne({
        $or: [{username},{email},]
    })
    if (exitedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    const avatarLocalPath= req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    // database entry user talk 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // check to user empty or not
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

export {
    registerUser
}
