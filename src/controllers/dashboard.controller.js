import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = new mongoose.Types.ObjectId(req.user.id);

    // Total videos uploaded by channel
    try {
        const totalVideos = await Video.countDocuments({
            owner: channelId,
        });

        // Total subscribers
        const totalSubscribers = await Subscription.countDocuments({
            channel: channelId,
        });

        // Total likes on all videos of this channel
        const totalLikes = await Like.aggregate([
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video",
                },
            },
            {
                $unwind: "$video",
            },
            {
                $match: {
                    "video.owner": channelId,
                },
            },
            {
                $count: "totalLikes",
            },
        ]);

        // Total views of all videos
        const totalViews = await Video.aggregate([
            {
                $match: {
                    owner: channelId,
                },
            },
            {
                $group: {
                    _id: null,
                    totalViews: {
                        $sum: "$views",
                    },
                },
            },
        ]);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    totalVideos,
                    totalSubscribers,
                    totalLikes: totalLikes[0]?.totalLikes || 0,
                    totalViews: totalViews[0]?.totalViews || 0,
                },
                "Channel stats fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Error while fetching channel stats");
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { page = 1, limit = 10, userId } = req.query;
    const isValidUserId = userId && mongoose.Types.ObjectId.isValid(userId);
    if (userId && !isValidUserId) {
        throw new ApiError(400, "Invalid userId");
    }

    const pipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user.id),
            },
        },
    ];

    try {
        const videos = await Video.aggregatePaginate(
            Video.aggregate(pipeline),
            {
                page: parseInt(page),
                limit: parseInt(limit),
            }
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    videos,
                    "Channel videos fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Error while fetching channel videos");
    }
});

export { getChannelStats, getChannelVideos };
