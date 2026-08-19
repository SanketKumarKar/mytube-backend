import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    try {
        const tweet = await Tweet.create({
            content,
            owner: userId,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, tweet, "Tweet created successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while creating tweet");
    }
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    try {
        const tweets = await Tweet.find({ owner: userId }); // Fetch tweets for the authenticated user
        if (tweets.length === 0) {
            return res
                .status(200)
                .json(
                    new ApiResponse(200, null, "No tweets found for this user")
                );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, tweets, "User tweets fetched successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Error while fetching user tweets");
    }
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body;
    const { tweetId } = req.params;

    try {
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }
        // koi aur na edit karle toh auth verify

        if (tweet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(
                403,
                "You are not authorized to update this tweet"
            );
        }

        if (!content) {
            throw new ApiError(400, "Content is required");
        }

        tweet.content = content;
        await tweet.save();
        return res
            .status(200)
            .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while updating tweet");
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    try {
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        if (tweet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(
                403,
                "You are not authorized to delete this tweet"
            );
        }

        await Tweet.findByIdAndDelete(tweetId);
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Tweet deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while deleting tweet");
    }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
