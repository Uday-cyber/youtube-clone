import asyncHanlder from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

export const registerUser = asyncHanlder( async (req, res) => {
    // get User details from frontend
    // validation in different file we just import it 
    // - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return respose

    const { username, email, fullName, password } = req.body;
    // console.log("Request Body: ", req.body);

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if(existingUser) throw new ApiError(409, "User already registered");
    // console.log("User", existingUser);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("Avatar Path: ", avatarLocalPath);

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log("Cover Image Path: ", coverImageLocalPath);
    // console.log("Request File Path: ", req.files);
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) throw new ApiError(400, "Avatar image is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(400, "Avatar image is required");

    const newUser = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    if(!createdUser) throw new ApiError(500, "Something went wrong while registering the user");

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
});  