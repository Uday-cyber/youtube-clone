import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import mongoose from "mongoose";

export const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if(!channelId) throw new ApiError(400, "Channel Id is required");

    const channel = await User.findById(channelId);
    if(!channel) throw new ApiError(404, "Channel not found");

    const videoStats = await Video.aggregate([
        {
            $match: { 
                owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                videoIds: { $push: "$_id"}
            }
        }
    ]);

    const totalVideos = videoStats[0]?.totalVideos || 0;
    const totalViews = videoStats[0]?.totalViews || 0;
    const videoIds = videoStats[0]?.videoIds || [];

    const totalSubscribers = await Subscription.countDocuments({
        channel: new mongoose.Types.ObjectId(channelId)
    });

    const totalLikes = videoIds.legth 
    ? await Like.countDocuments({
        video: { $in: videoIds }
    }) : 0;

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    );
});

export const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    let { page = 1, limit = 10 } = req.query;
    if(!channelId) throw new ApiError(400, "Channel Id is required");
    
    page = parseInt(page);
    limit = parseInt(limit);

    if(page < 1) page = 1;
    if(limit < 1 || limit > 50) limit = 10;

    const channel = await User.findById(channelId).populate("_id", "username avatar");
    if(!channel) throw new ApiError(404, "Channel not found");

    const skip = (page - 1) * limit;

    const [videos, totalVideos] = await Promise.all([
        Video.find({
            owner: channelId,
            isPublished: true
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("owner", "username avatar")
        .lean(),

        Video.countDocuments({
            owner: channelId,
            isPublished: true
        })
    ]);

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                // channel,
                page,
                totalPages: Math.ceil(totalVideos / limit),
                totalVideos,
                videos
            },
            "Channel videos fetched successfully"
        )
    );
});