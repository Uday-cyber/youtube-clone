import mongoose from "mongoose";

import { Playlist } from "../models/playlist.models.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPlaylist = asyncHandler( async (req, res) => {
    const { name, description } = req.body;
    if(!name || !name.trim()) throw new ApiError(400, "Playlist name is required");

    const sanitizedName = name.trim();
    const sanitizedDescription = description?.trim() || "";

    const checkExistingPlaylist = await Playlist.findOne({ owner: req.user._id, name: sanitizedName });
    if(checkExistingPlaylist) throw new ApiError(409, "Playlist with this name already exists");

    const playlist = await Playlist.create({
        name: sanitizedName,
        description: sanitizedDescription,
        videos: [],
        owner: req.user._id
    });

    return res.status(201)
    .json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
});

export const getUserPlaylists = asyncHandler( async (req, res) => {
    const { userId } = req.params;
    if(!userId) throw new ApiError(400, "UserId is required");

    const user = await User.findById(userId).select("_id username avatar");
    if(!user) throw new ApiError(404, "User not found");

    const playlists = await Playlist.find({ owner: userId })
    .sort({ createdAt: -1 })
    .lean()

    const formattedPlaylist = playlists.map(playlist => ({
        ...playlist,
        videoCount: playlist.videos.length,
        owner: user
    }));

    return res.status(200)
    .json(
        new ApiResponse(
            200, 
            { 
                total: formattedPlaylist.length, 
                playlists: formattedPlaylist 
            }, 
            "User playlists fetched successfully")
    );
});

export const getPlaylistById = asyncHandler( async (req, res) => {
    const { playlistId } = req.params;
    if(!playlistId) throw new ApiError(400, "PlaylistId is required");

    // if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    //     throw new ApiError(400, "Invalid playlistId");
    // }

    const playlist = await Playlist.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(playlistId) }
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
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "videos.owner",
                foreignField: "_id",
                as: "videoOwner",
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
                videos: {
                    $map: {
                        input: "$videos",
                        as: "video",
                        in: {
                            _id: "$$video._id",
                            title: "$$video.title",
                            thumbnail: "$$video.thumbnail",
                            duration: "$$video.duration",
                            views: "$$video.views",
                            owner: {
                                $first: {
                                    $filter: {
                                        input: "$videoOwner",
                                        as: "owner",
                                        cond: { $eq: ["$$owner._id", "$$video.owner"] }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                videoOwner: 0
            }
        }
    ]);

    if(!playlist.length) throw new ApiError(404, "Playlist not found");

    return res.status(200)
    .json(
        new ApiResponse(200, playlist[0], "Playlist fetched successfully")
    );
});

export const addVideoToPlaylist = asyncHandler( async (req, res) => {
    const { playlistId, videoId } = req.params;
    if(!playlistId || !videoId) throw new ApiError(400, "PlaylistId and VideoId are required");

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(404, "Playlist not found");

    
    if(playlist.owner.toString() !== req.user._id.toString()) 
        throw new ApiError(403, "You are not allowed to add video in this playlist");

    const checkVideo = await Video.findById(videoId);
    if(!checkVideo) throw new ApiError(404, "Video not found");

    if(playlist.videos.includes(videoId)) {
        return res.status(200)
        .json(
            new ApiResponse(200, playlist, "Video already exists in playlist")
        );
    }

    playlist.videos.push(videoId);
    await playlist.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

export const removeVideoFromPlaylist = asyncHandler( async (req, res) => {
    const { playlistId, videoId } = req.params;
    if(!playlistId || !videoId) throw new ApiError(400, "Both PlaylistId and VideoId are required");

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(404, "Playlist not found");

    if(playlist.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to delete video from this playlist");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video not found");

    if(!playlist.videos.includes(videoId)) {
        return res.status(200)
        .json(
            new ApiResponse(200, playlist, "Video not found in playlist")
        );
    }

    playlist.videos = playlist.videos.filter(
        v => v.toString() !== videoId
    );
    await playlist.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

export const deletePlaylist = asyncHandler( async (req, res) => {
    const { playlistId } = req.params;
    if(!playlistId) throw new ApiError(400, "PlaylistId is required");

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiError(404, "Playlist not found");

    if(playlist.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to delete playlist");

    await playlist.deleteOne();

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});

export const updatePlaylist = asyncHandler( async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if(!playlistId || (!name && !description)) throw new ApiError(400, "Playlist and name is required");

    const playlist = await Playlist.findById(playlistId);
    if(!playlist) throw new ApiError(404, "Playlist not found");

    if(playlist.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to update playlist");

    const sanitizedName = name.trim();
    const sanitizedDescription = description?.trim() || "";

    const checkExistingName = await Playlist.findOne(
        { 
            owner: req.user._id, 
            name: sanitizedName,
            _id: { $ne: playlistId }
        });

    if(checkExistingName) throw new ApiError(409, "You already have a playlist with this name");

    playlist.name = sanitizedName;
    playlist.description = sanitizedDescription;

    await playlist.save({ validateBeforeSave: false });
    
    return res.status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    );
});