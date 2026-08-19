import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    try {
        const existLike = await Like.findOne({
            video: videoId,
            likedBy: req.user._id,
        });
        if (existLike) {
            await Like.deleteOne({ video: videoId, likedBy: req.user._id });
        } else {
            const like = await Like.create({
                video: videoId,
                likedBy: req.user._id,
            });
        }
    } catch (e) {
        throw new ApiError(500, "Error while toggling video like");
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
    try {
        const existLike = await Like.findOne({
            comment: commentId,
            likedBy: req.user._id,
        });
        if (existLike) {
            await Like.deleteOne({ comment: commentId, likedBy: req.user._id });
        } else {
            const like = await Like.create({
                comment: commentId,
                likedBy: req.user._id,
            });
        }
        res.status(200).json(
            new ApiResponse(200, null, "Comment like toggled successfully")
        );
    } catch (e) {
        throw new ApiError(500, "Error while toggling comment like");
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
    try {
        const existLike = await Like.findOne({
            tweet: tweetId,
            likedBy: req.user._id,
        });
        if (existLike) {
            await Like.deleteOne({ tweet: tweetId, likedBy: req.user._id });
        } else {
            const like = await Like.create({
                tweet: tweetId,
                likedBy: req.user._id,
            });
        }
        res.status(200).json(
            new ApiResponse(200, null, "Tweet like toggled successfully")
        );
    } catch (e) {
        throw new ApiError(500, "Error while toggling tweet like");
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = new mongoose.Types.ObjectId(req.user._id);
    try {
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: userId,
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videos",
                },
            },
        ]);

        res.status(200).json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Error while fetching liked videos");
    }
});

const getCommentLikes = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    try {
        const commentLikes = await Like.countDocuments({ comment: commentId });

        res.status(200).json(
            new ApiResponse(
                200,
                { count: commentLikes },
                "Comment likes fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Error while fetching comment likes");
    }
});

const getTweetLikes = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    try {
        const tweetLikes = await Like.countDocuments({ tweet: tweetId });
        res.status(200).json(
            new ApiResponse(
                200,
                { count: tweetLikes },
                "Tweet likes fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Error while fetching tweet likes");
    }
});

const getVideoLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    try {
        const videoLikes = await Like.countDocuments({ video: videoId });
        res.status(200).json(
            new ApiResponse(
                200,
                { count: videoLikes },
                "Video likes fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Error while fetching video likes");
    }
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getCommentLikes,
    getTweetLikes,
    getVideoLikes,
};
