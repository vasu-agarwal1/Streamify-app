import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || name.trim() == "") {
        throw new ApiError(400, "Name is required")
    }

    const playlist = await Playlist.create({
        description: description || "",
        name: name,
        owner: req.user?._id,
    })

    if (!playlist) {
        throw new ApiError(404, "Error in creating new playlist")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            playlist,
            "playlist created success fully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!userId) {
        throw new ApiError(400, "userId is required")
    }

    const playlist = await Playlist.find({
        owner: userId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist fetched successfully"
        )
    )

    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

     if (!playlistId) {
        throw new ApiError(400, "playlistId is required")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
       
    ]
    )
     if (!playlist || playlist.length === 0) {
        throw new ApiError(404, "Playlist not found");
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist[0],
            "playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}