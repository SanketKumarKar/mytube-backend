import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getCommentLikes,
    getTweetLikes,
    getVideoLikes
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/c/:commentId").get(getCommentLikes);
router.route("/t/:tweetId").get(getTweetLikes);
router.route("/v/:videoId").get(getVideoLikes);

export default router