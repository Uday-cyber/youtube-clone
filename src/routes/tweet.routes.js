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

tweetRouter.route("/tweet/:tweetId")
.patch(
    verifyJWT,
    updateTweet
)
.delete(
    verifyJWT,
    deleteTweet
);

export default tweetRouter;