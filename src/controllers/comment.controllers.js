import mongoose from "mongoose";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import ApiResponse from "../utils/ApiResponse.js";


export const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) throw new ApiError(400, "Video link not found");
    
    let {page = 1, limit = 10} = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 50) limit = 10;

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video not found");

    const skip = (page - 1) * limit;

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const getVideoComments = await Comment.aggregate([
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $sort: { createdAt: -1 }
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
            $lookup: {
            from: "likes",
            let: { commentId: "$_id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$comment", "$$commentId"] },
                                { $eq: ["$likedBy", userId] }
                            ]
                        }
                    }
                }
            ],
            as: "userLike"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                },
                isOwner: {
                    $eq: ["$owner._id", userId]
                },
                isLiked: {
                    $gt: [{ $size: "$userLike" }, 0] 
                }
            }
        },
        { $project: { userLike: 0 } },
        {
            $facet: {
                comments: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        },
        {
            $project: {
                comments: 1,
                totalComments: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$totalCount.count", 0]
                        },0
                    ]
                }
            }
        }
    ]);

    return res.status(200)
    .json(
        new ApiResponse(200, getVideoComments[0], "comments fetched successfully")
    );
});

export const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;
    if(!content || !videoId) throw new ApiError(400, "Comment content and VideoId are required");

    const SanitizedComment = content.trim();
    if(!SanitizedComment) throw new ApiError(400, "Comment can not be empty");

    const video = await Video.findOne({ _id: videoId });
    if(!video) throw new ApiError(404, "Video not found");

    const comment = await Comment.create({
        content: SanitizedComment,
        owner: req.user._id,
        video: videoId
    });

    video.commentCount = (video.commentCount || 0) + 1;
    
    await video.save({ validateBeforeSave: false });

    const ResponseComment = {
        _id: comment._id,
        content: comment.content,
        owner: {
            _id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        },
        video: videoId,
        createdAt: comment.createdAt
    }

    return res.status(201)
    .json(
        // new ApiResponse(201, {video}, "Comment added Successfully")
        new ApiResponse(201, {ResponseComment}, "Comment added Successfully")
    );
});

export const updateComment = asyncHandler(async (req, res) => {
    const { commentId, videoId } = req.params;
    const { content } = req.body;
    if(!content || !videoId) throw new ApiError(400, "Comment content and videoId are required");

    const SanitizedComment = content.trim();
    if(!SanitizedComment) throw new ApiError(400, "Comment can't be empty");

    const video = await Video.findById(videoId );
    if(!video) throw new ApiError(404, "Video not found");

    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404, "Comment not found");

    if(comment.video.toString() !== videoId)
        throw new ApiError(400, "Comment does not belongs to this video");

    if(comment.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to edit this comment")

    comment.content = SanitizedComment;

    await comment.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, Comment, "Comment updated successfully")
    );
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId, videoId } = req.params;

    if(!commentId || !videoId) throw new ApiError(400, "CommentId and videoId are required");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video not found");

    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404, "Comment not found");

    if(comment.video.toString() !== videoId)
        throw new ApiError(400, "Comment does not belongs to this video");

    if(comment.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to delete the comment");

    await comment.deleteOne();

    if(video.commentCount > 0){
        video.commentCount -= 1;
        await video.save({ validateBeforeSave: false });
    }

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});