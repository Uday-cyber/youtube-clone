import express from "express";

import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { registerValidator } from "../validators/auth.validators.js";
import { validate } from "../middlewares/validate.middlewares.js";

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


export default userRouter;