import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const totalSubscribers = await Subscription.countDocuments({channel: req.user?._id})

    const totalVideos = await Video.countDocuments({owner: req.user?._id})

    const videoStats = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $group:{
                _id: null,
                totalViews : {$sum : "$views"}
            }
        }
    ]) 

    const totalViews = videoStats.length > 0 ? videoStats[0].totalViews : 0

    const likeStats = await Like.aggregate([
        {
            $match: {
                video : {$exists : true}
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as : "likedVideos"
            }
        },
        {
            $match: {
                "likedVideos.owner" : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $count: "totalLikes"
        }
    ])

    const totalLikes = likeStats.length > 0 ? likeStats[0].totalLikes : 0

    const stats = {
        totalSubscribers,
        totalVideos,
        totalViews,
        totalLikes
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        stats,
        "all Channel stats fetched successfully"
    ))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { page = 1, limit = 10, } = req.query
    const { userId } = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(401,"invalid userId")
    }

    const paginate = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ]

    const options =  {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        }

    const video = await Video.aggregatePaginate(paginate, options)

     if (!video || video.docs.length === 0) {
        // It's good to handle the case where a user has no videos
        return res
            .status(200)
            .json(new ApiResponse(200,[], "No videos found for this channel"));
    }

    return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        video,
        "video founded successfully"
    )
   )
})

export {
    getChannelStats, 
    getChannelVideos
    }