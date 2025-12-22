import express from "express";

import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { registerValidator } from "../validators/auth.validators.js";
import { validate } from "../middlewares/validate.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const userRouter = express.Router();

userRouter.route("/register")
.post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerValidator,
    validate,
    registerUser
);

userRouter.route("/login")
.post(
    loginUser
);

userRouter.route("/logout")
.post(
    verifyJWT,
    logoutUser
);

userRouter.route("/refresh-token")
.post(
    refreshAccessToken
);

userRouter.route("/change-password")
.post(
    verifyJWT,
    changeCurrentPassword
);

userRouter.route("/currentUser")
.get(
    verifyJWT,
    getCurrentUser
);

userRouter.route("/update-account")
.patch(
    verifyJWT,
    updateAccountDetails
);

userRouter.route("/update-avatar")
.patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

userRouter.route("/update-coverImage")
.patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

userRouter.route("/c/:username")
.get(
    verifyJWT,
    getUserChannelProfile
);

userRouter.route("/watch-history")
.get(
    verifyJWT,
    getWatchHistory
);

export default userRouter;