import jwt from "jsonwebtoken";

import asyncHanlder from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Unable to generate tokens");
  }
};

export const registerUser = asyncHanlder(async (req, res) => {
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
    $or: [{ username }, { email }],
  });
  if (existingUser) throw new ApiError(409, "User already registered");
  // console.log("User", existingUser);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // console.log("Avatar Path: ", avatarLocalPath);

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log("Cover Image Path: ", coverImageLocalPath);
  // console.log("Request File Path: ", req.files);

  let coverImageLocalPath;
  if ( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) throw new ApiError(400, "Avatar image is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar image is required");

  const newUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(newUser._id).select( "-password -refreshToken" );
  if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user");

  return res.status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export const loginUser = asyncHanlder(async (req, res) => {
  // get User login details from frontend
  // authentication with username or email
  // find the user
  // password check
  // give access token and refresh token
  // send cookie
  // send response

  const { username, email, password } = req.body;

  if (!username && !email)
    throw new ApiError(400, "All details are required");
    // if(!email) throw new ApiError(400, "Email is required")

  const user = await User.findOne({
    $or: [{ username }, { email }],
    // $or: [{ email }]
  });
  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Incorrect Password");

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select( "-password -refreshToken" ); //optional step

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken,
        },
        "User loggedIn successfully"
      )
    );
});

export const logoutUser = asyncHanlder(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    );
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, "User logout successfully") )
});

export const refreshAccessToken = asyncHanlder(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken) throw new ApiError(401, "Unauthorized Request")

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.SECRET_REFRESH_TOKEN);

    const user = await User.findById(decodedToken?._id);
    if(!user) throw new ApiError(401, "Invalid Refresh Token")

    if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh Token is expired or used")
    
    const { accessToken, refreshToken } = await generateTokens(user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {accessToken, refreshToken},"Successfully refreshed access token")
    )
});
