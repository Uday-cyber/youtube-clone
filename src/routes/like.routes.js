import express from "express";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controllers.js";

const likeRouter = express.Router();

likeRouter.route("/video/:videoId")
.post(
    verifyJWT,
    toggleVideoLike
);

likeRouter.route("/comment/:commentId")
.post(
    verifyJWT,
    toggleCommentLike
);

likeRouter.route("/tweet/:tweetId")
.post(
    verifyJWT,
    toggleTweetLike
);

likeRouter.route("/videos")
.get(
    verifyJWT,
    getLikedVideos
);

export default likeRouter;