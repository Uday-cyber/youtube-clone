import mongoose from "mongoose";

import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { deleteVideoFromCloudinary, deleteImageFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

export const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if(page < 1) page = 1;
    if(limit < 1 || limit > 50) limit =  10;

    const filter = { isPublished: true };

    if(query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if(userId && mongoose.Types.ObjectId.isValid(userId)) {
        filter.owner = userId;
    }

    const allowedSortFields = ["createdAt", "views", "duration"];
    if(!allowedSortFields.includes(sortBy)) sortBy = "createdAt";

    const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

    const skip = (page - 1) * limit;

    const [videos, totalVideos] = await Promise.all([
        Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("owner", "username avatar")
        .lean(),

        Video.countDocuments(filter)
    ]);

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                page,
                totalPage: Math.ceil(totalVideos / limit),
                totalVideos,
                videos
            },
            "Videos fetched successfully"
        )
    );
});

export const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if(!title || !description) throw new ApiError(400, "title and description are required");

    const sanitizeTitle = title.trim();
    const sanitizeDescription = description.trim();

    const videoLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if(!videoLocalPath) throw new ApiError(400, "Video is required");
    if(!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    if(!videoUpload) throw new ApiError(500, "Error while uploading video on cloud");

    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnailUpload) throw new ApiError(500, "Erro while uploading thumbnail on cloud");

    const newVideo = await Video.create({
        videoFile: videoUpload ? { url: videoUpload.url, public_id: videoUpload.public_id } : undefined,
        thumbnail: thumbnailUpload ? { url: thumbnailUpload.url, public_id: thumbnailUpload.public_id } : undefined,
        owner: req.user._id,
        title: sanitizeTitle,
        description: sanitizeDescription,
        duration: videoUpload.duration, 
        isPublished: true,
    });

    const populateVideo = await Video.findById(newVideo._id)
    .populate("owner", "username avatar");

    return res.status(200)
    .json(
        new ApiResponse(200, populateVideo, "Video published successfully")
    );
});

export const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) throw new ApiError(400, "Video Id is required");

    const video = await Video.findById(videoId).populate("owner", "username avatar");
    if(!video || !video.isPublished) throw new ApiError(404, "Video not found");

    video.views += 1;
    await video.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

export const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    if(!videoId) throw new ApiError(400, "Video Id is required");
    if(!title || !description) throw new ApiError(400, "Title and description are required");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video not found");

    if(video.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to update video");

    const sanitizeTitle = title.trim();
    const sanitizeDescription = description.trim();

    video.title = sanitizeTitle;
    video.description = sanitizeDescription;

    const oldthumbnailPublicId = video.thumbnail.public_id;

    if(req.file?.path){
        const thumbnailUpload = await uploadOnCloudinary(req.file.path);
        if(!thumbnailUpload) throw new ApiError(500, "Error while uploading thumbnail on cloud");

        video.thumbnail = thumbnailUpload 
        ? { url: thumbnailUpload.url, public_id: thumbnailUpload.public_id }
        : undefined

        await video.save({ validateBeforeSave: false });

        if(oldthumbnailPublicId) await deleteImageFromCloudinary(oldthumbnailPublicId);
    } else await video.save({ validateBeforeSave: false });


    const populateVideo = await Video.findById(video._id)
    .populate("owner", "username avatar");

    return res.status(200)
    .json(
        new ApiResponse(200, populateVideo, "Video update successfully")
    );
});

export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) throw new ApiError(400, "Video Id is required");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video not found");

    if(video.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to delete video");

    await video.deleteOne();

    await Promise.all([
        deleteVideoFromCloudinary(video.videoFile.public_id),
        deleteImageFromCloudinary(video.thumbnail.public_id)
    ]);


    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) throw new ApiError(400, "Video Id is required");

    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404, "Video not found");

    if(video.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to update toggle of this video")

    video.isPublished = !video.isPublished;

    await video.save({ validateBeforeSave: false });

    return res.status(200)
    .json(
        new ApiResponse(200, {isPublished: video.isPublished}, "Publish Toggled successfully")
    );
});