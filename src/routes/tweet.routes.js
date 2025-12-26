import express from "express";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controllers.js";

const tweetRouter = express.Router();

tweetRouter.route("/")
.post(
    verifyJWT,
    createTweet
);

tweetRouter.route("/user/:userId")
.get(
    verifyJWT,
    getUserTweet
);

tweetRouter.route("/:tweetId")
.patch(
    verifyJWT,
    updateTweet
);

tweetRouter.route("/:tweetId")
.delete(
    verifyJWT,
    deleteTweet
);

export default tweetRouter;