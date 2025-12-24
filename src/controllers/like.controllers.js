import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js"
import ApiResponse from "../utils/ApiResponse.js";

export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) throw new ApiError(400, "VideoId is required");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video not found");

    const userId = req.user?._id;

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    let isLiked;

    if(existingLike){
        await existingLike.deleteOne();
        video.likeCount = Math.max((video.likeCount || 0) - 1, 0);
        isLiked = false;
    }
    else{
        await Like.create({
            video: videoId,
            likedBy: userId
        });
        video.likeCount = (video.likeCount || 0) + 1;
        isLiked = true;
    }

    await video.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, { isLiked, likedCount: video.likeCount }, "Video like toggled successfully")
    );
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if(!commentId) throw new ApiError(400, "CommentId is required");

    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404, "Comment not found");

    const userId = req.user?._id;

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    let isLiked;

    if(existingLike){
        await existingLike.deleteOne();
        comment.likeCount = Math.max((comment.likeCount || 0) - 1 , 0);
        isLiked = false;
    } else{
        await Like.create({
            comment: commentId,
            likedBy: userId
        });
        comment.likeCount = (comment.likeCount || 0) + 1;
        isLiked = true;
    }

    await comment.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, {isLiked, likeCount: comment.likeCount}, "comment like toggled successfully")
    );
});

export const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if(!tweetId) throw new ApiError(400, "TweetId is required");

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404, "Tweet not found");

    const userId = req.user._id;

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    let isLiked;

    if(existingLike){
        await existingLike.deleteOne();
        tweet.likeCount = Math.max((tweet.likeCount || 0) - 1, 0);
        isLiked = false;
    } else{
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        });
        tweet.likeCount = (tweet.likeCount || 0) + 1;
        isLiked = true;
    }

    await tweet.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, { isLiked, likeCount: tweet.likeCount}, "Tweet like toggled successfully")
    );
});

export const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const likedVideos = await Like.aggregate([
        {
            $match: { 
                likedBy: userId,
                video: { $exists: true } 
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video.owner",
                foreignField: "_id",
                as: "video.owner",
            },
        },
        {
            $unwind: "$video"
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                "video.owner": {
                    $first: "$video.owner"
                }
            }
        },
        {
            $replaceRoot: {
                newRoot: "$video"
            }
        }
    ]);

    return res.status(200)
    .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});