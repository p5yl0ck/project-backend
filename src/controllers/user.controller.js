import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res)=>{
    const {fullName , email, username, password } = req.body
    console.log("email: ",email);

    if (
        [fullName , email, username, password].some((field)=>
        field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409,"User with Email Or Username already Exists")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;         //yeh req.files ka acces multer / middleware ki wajah se milti h
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar file required")
    }

   const user =  await User.create({  //since creating an instance on DB is time taking use await
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createduser = await user.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createduser) {
        throw new ApiError(500, "error while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,createduser, "user registered succesfully")
    )

})



export {registerUser}

    //algo for register user 
    
    //1. get user details accor to user model from frontend
    //2. validate user fields - not empty(validation frontend me rehte h but bakend me bhi chahiye)
    //3. check if user already exists: user, email
    //4. check for images check for avatar
    //5. upload on cloudinary, avatar check (user ne diya aur upload hua ya nahi)
    //6. create user objects - create entry in DB(.create)
    //7. remove passwords and refresh token fields from response
    //8. check for user creation --> then return response