import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// method for generating access and refresh token
const generateAccessAndRefreshTokens = async(userId)=>{
    try {
       const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})
        // this save method update the refresh token in Db so db constraints will kick in
        // like other fields required so >validateBeforeSave: false will stop those parameters from kicking in
       
        return{accessToken, refreshToken}

    } catch (error) {
        throw new ApiError("500", "something went wrong while generating access and refresh toke")
    }
}




// stepwise breakdown of registering user
const registerUser = asyncHandler( async (req, res) => {
   
    // 1. get user details from frontend
    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    // 2.validation - not empty
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    
    //3. check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

   
   // 4. check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    
    // 5.upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    
    // 6. create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    
    // 7. remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    
    // 8. check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    
    
    //9. return response with statuscode
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async(req, res) => {
    // req body se data le aao
    // username or email based login
    // find the user
    // password check 
    // access aur refresh token generate kro aggr password sahi ho to
    // send cookie and response(cookie form me tokens aate hai)

    
    //step 1 get data from body 
    const{email, username , password} = req.body

    //step 2 check email or username
    if (!username || !email){
        throw new ApiError(400, "username or email is required")
    }

    //step 3. find the user
   const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {  //if user not found throw error
        throw new ApiError(404, "user does not exist")
    }

    // step 4 password check and compare compare 
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401 , "invalid user credentials")
    }

    // step 5 generate access and refresh token

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    //update user object optional
    const loggedInUser = await User.findById(user._id).select("-password, -refreshToken")

    // send response as a cookie
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",refreshToken ,options)
    .json(
        new ApiResponse(
            200,
            {
               user: loggedInUser, accesToken, refreshToken
            },
            "User logged in Succesfully"
        )
    )

})

const logoutUser = asynchandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set: {
                refreshToken: undefined
            }
            
        },{
            new: true
        }
    )
})


const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged out"))






export {
    registerUser,
    loginUser,
    logoutUser
}

























// const registerUser = asyncHandler( async(req,res)=>{
//     const {fullName , email, username, password } = req.body
//     console.log("email: ",email);

//     if (
//         [fullName , email, username, password].some((field)=>
//         field?.trim() === "")
//     ) {
//         throw new ApiError(400, "all fields are required")
//     }

//     const existedUser = await User.findOne({
//         $or: [{username}, {email}]
//     })

//     if (existedUser) {
//         throw new ApiError(409,"User with Email Or Username already Exists")
//     }
    
//     const avatarLocalPath = req.files?.avatar[0]?.path;         //yeh req.files ka acces multer / middleware ki wajah se milti h
//     //const coverImageLocalPath = req.files?.coverImage[0]?.path
//     let coverImageLocalPath;
//     if (req.files && Array.isArray(req.files.coverImage)&&
//     req.files.coverImage.length > 0) {
//         coverImageLocalPath = req.files.coverImage[0]
//     }



//     if(!avatarLocalPath){
//         throw new ApiError(400, "Avatar file is required")
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

//     if (!avatar) {
//         throw new ApiError(400, "avatar file required")
//     }

//    const user =  await User.create({  //since creating an instance on DB is time taking use await
//         fullName,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "",
//         email,
//         password,
//         username: username.toLowerCase()
//     })

//     const createdUser = await User.findById(user._id).select(
//         "-password -refreshToken"
//     )

//     if (!createdUser) {
//         throw new ApiError(500, "error while registering user")
//     }

//     return res.status(201).json(
//         new ApiResponse(200,createduser, "user registered succesfully")
//     )

// })





    //algo for register user 
    
    //1. get user details accor to user model from frontend
    //2. validate user fields - not empty(validation frontend me rehte h but bakend me bhi chahiye)
    //3. check if user already exists: user, email
    //4. check for images check for avatar
    //5. upload on cloudinary, avatar check (user ne diya aur upload hua ya nahi)
    //6. create user objects - create entry in DB(.create)
    //7. remove passwords and refresh token fields from response
    //8. check for user creation --> then return response