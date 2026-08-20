import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    try {
        const playlist = new Playlist({
            name,
            description,
            owner: userId,
        });

        return res
            .status(201)
            .json(
                new ApiResponse(201, playlist, "Playlist created successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Error while creating playlist");
    }

    //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const isValidUserId = isValidObjectId(userId);
    if (!isValidUserId) {
        throw new ApiError(400, "Invalid user ID");
    }
    //TODO: get user playlists
    try {
        const playlists = await Playlist.find({ owner: userId });
        if (!playlists.length) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        null,
                        "No playlists found for this user"
                    )
                );
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { playlists, count: playlists.length },
                    "Playlists fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Error while fetching playlists");
    }
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const isValidPlaylistId = isValidObjectId(playlistId);
    if (!isValidPlaylistId) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    //TODO: get playlist by id
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Playlist fetched successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Error while fetching playlist");
    }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    const isValidPlaylistId = isValidObjectId(playlistId);
    const isValidVideoId = isValidObjectId(videoId);
    if (!isValidPlaylistId) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!isValidVideoId) {
        throw new ApiError(400, "Invalid video ID");
    }
    // TODO: add video to playlist
    try {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        const videoExists = playlist.videos.includes(videoId);
        if (videoExists) {
            throw new ApiError(400, "Video already exists in playlist");
        }

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }
        playlist.videos.push(videoId); // khali id store karna hai, poora video object nahi
        playlist.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    playlist,
                    "Video added to playlist successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Error while adding video to playlist");
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    const isValidPlaylistId = isValidObjectId(playlistId);
    const isValidVideoId = isValidObjectId(videoId);
    if (!isValidPlaylistId) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if (!isValidVideoId) {
        throw new ApiError(400, "Invalid video ID");
    }
    // TODO: remove video from playlist
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        const videoExists = playlist.videos.includes(videoId);
        if (!videoExists) {
            throw new ApiError(404, "Video not found in playlist");
        }
        playlist.videos = playlist.videos.filter(
            (id) => id.toString() !== videoId.toString()
        );
        await playlist.save();
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    playlist,
                    "Video removed from playlist successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Error while removing video from playlist");
    }
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const isValidPlaylistId = isValidObjectId(playlistId);
    if (!isValidPlaylistId) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    // TODO: delete playlist
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        await Playlist.findByIdAndDelete(playlistId);
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while deleting playlist");
    }
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const isValidPlaylistId = isValidObjectId(playlistId);
    if (!isValidPlaylistId) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    //TODO: update playlist
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
        playlist.name = name || playlist.name; //kuch nhi diya toh purana hi rahega, agar diya toh update ho jaayega
        playlist.description = description || playlist.description;
        await playlist.save();
        return res
            .status(200)
            .json(
                new ApiResponse(200, playlist, "Playlist updated successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Error while updating playlist");
    }
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
