import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
//import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Validate userId
    const isValidUserId = userId && isValidObjectId(userId);

    if (userId && !isValidUserId) {
        throw new ApiError(400, "Invalid userId");
    }

    // Validate sortBy
    const allowedSortFields = ["createdAt", "views", "duration", "title"];

    if (sortBy && !allowedSortFields.includes(sortBy)) {
        throw new ApiError(400, "Invalid sort field");
    }

    // Validate sortType
    if (sortType && sortType !== "asc" && sortType !== "desc") {
        throw new ApiError(400, "Invalid sort type");
    }

    let pipeline = [];

    // No filters → Random videos
    if (!query && !sortBy && !sortType && !userId) {
        pipeline.push({
            $sample: {
                size: 60,
            },
        });
    } else {
        // Filtering
        pipeline.push({
            $match: {
                ...(query && {
                    title: {
                        $regex: query,
                        $options: "i",
                    },
                }),

                ...(userId && {
                    owner: new mongoose.Types.ObjectId(userId),
                }),
            },
        });

        // Sorting
        if (sortBy && sortType) {
            pipeline.push({
                $sort: {
                    [sortBy]: sortType === "asc" ? 1 : -1,
                },
            });
        }
    }
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $unwind: "$owner",
        },
        {
            $project: {
                // video fields
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,

                // only required owner fields
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    avatar: "$owner.avatar",
                },
            },
        }
    );
    // Pagination
    try {
        const videos = await Video.aggregatePaginate(
            Video.aggregate(pipeline),
            {
                page: parseInt(page),
                limit: parseInt(limit),
            }
        );
    } catch (error) {
        throw new ApiError(500, "Error while fetching videos");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // Get uploaded files
    const videoFile = req.files?.videoFile?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    // Upload both files simultaneously
    const [uploadedVideo, uploadedThumbnail] = await Promise.all([
        uploadOnCloudinary(videoFile, "video"),
        uploadOnCloudinary(thumbnail, "image"),
    ]);

    if (!uploadedVideo || !uploadedThumbnail) {
        throw new ApiError(500, "Error while uploading video or thumbnail");
    }

    // Validate duration
    const duration = req.body.duration ? parseFloat(req.body.duration) : 0;

    if (isNaN(duration) || duration <= 0) {
        throw new ApiError(400, "Invalid duration");
    }

    // Create video
    try {
        const newVideo = await Video.create({
            videoFile: uploadedVideo.secure_url,
            thumbnail: uploadedThumbnail.secure_url,
            title,
            description,
            duration,
            owner: req.user._id,
        });

        return res
            .status(201)
            .json(
                new ApiResponse(201, newVideo, "Video published successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Error while publishing video");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
    const isValidVideoId = isValidObjectId(videoId);
    if (!isValidVideoId) {
        throw new ApiError(400, "Invalid videoId");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnail = req.file;
    //TODO: update video details like title, description, thumbnail
    const isValidVideoId = isValidObjectId(videoId);
    if (!isValidVideoId) {
        throw new ApiError(400, "Invalid videoId");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    try {
        video.title = title || video.title;
        video.description = description || video.description;
        video.thumbnail = thumbnail
            ? (await uploadOnCloudinary(thumbnail, "image")).secure_url
            : video.thumbnail;
    } catch (error) {
        throw new ApiError(500, "Error while updating video");
    }
    //TODO: Implement video update logic
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    const isValidVideoId = isValidObjectId(videoId);
    if (!isValidVideoId) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    try {
        await video.remove();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Video deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while deleting video");
    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: Implement toggle publish status logic
    const isValidVideoId = isValidObjectId(videoId);
    if (!isValidVideoId) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to toggle publish status of this video"
        );
    }

    video.isPublished = !video.isPublished;
    try {
        await video.save();
    } catch (error) {
        throw new ApiError(500, "Error while toggling publish status");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Publish status toggled successfully")
        );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
