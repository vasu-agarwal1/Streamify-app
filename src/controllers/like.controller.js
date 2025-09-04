import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(404,"videoId is needed")
    }

    const isLike = await Like.findOne({
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: req.user?._id
    }) 
    let likeStatus

    if (isLike) {
        await isLike.deleteOne()
        likeStatus = {isLiked : false}

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likeStatus,
                "Successfully removed from liked "
            )
        )
    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        likeStatus = {isLiked: true}

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likeStatus,
                "Successfully liked"
            )
        )
        
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(404,"commentId is needed")
    }
    const userId = req.user?._id

    const isLike = await Like.findOne({
        comment: commentId,
        likedBy: userId,
    })
    let likeStatus

    if (isLike) {
        await isLike.deleteOne()

        likeStatus = {isLiked : false}

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likeStatus,
                "Successfully removed from liked "
            )
        )
    } else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        })

        likeStatus = {isLiked : true}

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likeStatus,
                "Successfully liked"
            )
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user?._id

    const isLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })
    let likeStatus

    if (isLike) {
        await isLike.deleteOne()

        likeStatus = {isLiked : false}

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likeStatus,
                "Successfully removed from likes"
            )
        )
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        likeStatus = {isLiked: true}

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likeStatus,
                "Successfully liked"
            )
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id
    if(!userId){
        throw new ApiError(404, "user is not logged in")
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true }//filters out tweet and comments liked and gives only liked video
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetail"
            }
        },
        {
            $replaceRoot: {
                newRoot: {$first: "$videoDetail"}
            }
        },
        {
            $project: {
                title: 1,
                videoFile: 1,
                thumbnail: 1,
                description: 1 
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "these are all the videos liked by you"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}