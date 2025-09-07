import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


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

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(404,"invalid playlist or video Id")
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user?._id
    })
    if (!playlist) {
        throw new ApiError(400,"Unauthorized request")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404,"video don't exist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(    
         playlistId,
        {
            $addToSet:{
                videos: videoId
            }
        },
        {new: true}
    )
    if(!updatedPlaylist){
        throw new ApiError(403,"Error in updating playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "videos successfully added to playlist"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

     if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(404,"invalid playlist or video Id")
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user?._id
    })
    if (!playlist) {
        throw new ApiError(400,"Unauthorized request")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(500,"Error in deleting video")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "videos successfully deleted from playlist"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400, "playlistId is required")
    }

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user?._id
    })

    if (!playlist ) {
        throw new ApiError(404, "Playlist not deleted from DB");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"deleted the playlist"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

     const updateFields = {};

    // 2. Dynamically populate the object
    if (name && name.trim() !== "") {
        updateFields.name = name;
    }
    if (description) { // Description is optional, so we just check if it was provided
        updateFields.description = description;
    }

     if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No fields to update were provided.");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $set: updateFields
        },
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiError(500,"Error in Updating playlis")
    }

     return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Successfully edited playlist"
        )
    )

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