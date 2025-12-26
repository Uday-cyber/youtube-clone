import mongoose from "mongoose";

import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createTweet = asyncHandler( async (req, res) => {
    const { content } = req.body;
    if(!content) throw new ApiError(400, "Tweet content is required");

    const sanitizedContent = content.trim();

    const tweet = await Tweet.create({
        owner: req.user._id,
        content: sanitizedContent
    });

    const populateTweet = await Tweet.findById(tweet._id)
    .populate("owner", "username avatar");

    return res.status(201)
    .json(
        new ApiResponse(201, populateTweet, "Tweet created successfully")
    );
});

export const getUserTweet = asyncHandler( async (req, res) => {
    const { userId } = req.params;
    if(!userId) throw new ApiError(400, "UserId is required");

    const user = await User.findById(userId);
    if(!user) throw new ApiError(404, "User not found");

    const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .lean()
    .populate("owner", "username avatar");

    return res.status(200)
    .json(
        new ApiResponse(
            200, 
            {
                totalTweets: tweets.length,
                tweets,
            }, 
            "User tweets fetched successfully")
    );
});

export const updateTweet = asyncHandler( async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    if(!tweetId || !content) throw new ApiError(400, "UserId and content are required");

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404, "Tweet not found");

    const sanitizedContent = content.trim();

    if(tweet.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to update tweet");

    tweet.content = sanitizedContent;

    await tweet.save({ validateBeforeSave: false });

    const updatedTweet = await Tweet.findById(tweet._id)
    .populate("owner", "username avatar")

    return res.status(200)
    .json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

export const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if(!tweetId) throw new ApiError(400, "TweetId is required");

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404, "Tweet not found");

    if(tweet.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to delete tweet");

    await tweet.deleteOne();

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
});