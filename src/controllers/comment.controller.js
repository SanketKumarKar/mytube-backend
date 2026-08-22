import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const comments = await Comment.find({ video: videoId })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("commentedBy", "username avatar")
            .sort({ createdAt: -1 });
        if (!comments.length === 0) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        null,
                        "No comments found for this video"
                    )
                );
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { comments },
                    "Comments fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Error while fetching comments");
    }
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    const { _id: commentedById } = req.user; // user ki id request se le rahe hain

    try {
        const comment = await Comment.create({
            content,
            video: videoId,
            commentedBy: commentedById,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, comment, "Comment added successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while adding comment");
    }
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        if (comment.commentedBy.toString() !== req.user._id.toString()) {
            throw new ApiError(
                403,
                "You are not authorized to update this comment"
            );
        }

        comment.content = content;
        await comment.save();

        return res
            .status(200)
            .json(
                new ApiResponse(200, comment, "Comment updated successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Error while updating comment");
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        if (comment.commentedBy.toString() !== req.user._id.toString()) {
            throw new ApiError(
                403,
                "You are not authorized to delete this comment"
            );
        }

        await Comment.findByIdAndDelete(commentId);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Comment deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while deleting comment");
    }
});

export { getVideoComments, addComment, updateComment, deleteComment };
