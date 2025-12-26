import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.models.js"
import { User } from "../models/user.models.js";
import mongoose from "mongoose";


export const toggleSubscription = asyncHandler( async (req, res) => {
    const { channelId } = req.params;
    if(!channelId) throw new ApiError(400, "ChannelId is required");

    if(channelId === req.user._id.toString())
        throw new ApiError(400, "You can not subscribe to yourself");

    const channel = await User.findById(channelId);
    if(!channel) throw new ApiError(404, "Channel not found");

    const existingSubscriber = await Subscription.findOne({ subscriber: req.user._id, channel: channelId });

    let isSubscribed;

    if(existingSubscriber){
        await existingSubscriber.deleteOne()
        isSubscribed = false;
    }
    else{
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
        isSubscribed = true;
    }

    return res.status(200)
    .json(
        new ApiResponse(200, { isSubscribed }, "Subscription toggled successfully")
    );
});

export const getUserChannelSubscribers = asyncHandler( async (req, res) => {
    const { channelId } = req.params;
    if(!channelId) throw new ApiError(400, "ChannelId is required");

    const channel = await User.findById(channelId);
    if(!channel) throw new ApiError(404, "Channel not found");

    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
            $unwind: "$subscriber"
        },
        {
          $project: {
            _id: 0,
            subscribedAt: "$createdAt",
            subscriber: 1
          }  
        }
    ]);

    return res.status(200)
    .json(
        new ApiResponse(
            200, 
            { 
                totalSubscribers: subscribers.length, 
                subscribers 
            }, 
            "Subscribers fetched successfully"
        )
    )
});

export const getSubscribedChannels = asyncHandler( async (req, res) => {
    const { subscriberId } = req.params;
    if(!subscriberId) throw new ApiError(400, "SubscriberId is required");

    const subscriber = await User.findById(subscriberId);
    if(!subscriber) throw new ApiError(404, "User not found");

    const channels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "channel",
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
            $unwind: "$channel"
        },
        {
            $project: {
                _id: 0,
                subscribedAt: "$createdAt",
                channel: 1
            }
        }
    ]);

    return res.status(200)
    .json(
        new ApiResponse(
            200, 
            {
                totalSubscriptions: channels.length, 
                channels
            },
            "Subscribed channels fetched successfully"
        )
    );
});