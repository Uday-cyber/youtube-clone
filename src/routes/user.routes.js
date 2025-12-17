import express from "express";

import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
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


export default userRouter;