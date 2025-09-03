import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { json } from "express"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(404,"channelId is needed")
    }
    // TODO: toggle subscription
    const subscriberId = req.user._id

    const subDetail = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    let subscriptionStatus;
    if(subDetail){
       await subDetail.deleteOne()
       subscriptionStatus = {isSubscribed: false} 
       return res
        .status(200)
        .json(new ApiResponse(200, subscriptionStatus, "Channel UnSubscribed"))
    
    }else{
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        })
        subscriptionStatus = {isSubscribed: true}

        return res
        .status(200)
        .json(new ApiResponse(200, subscriptionStatus, "Channel Subscribed"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(404,"channelId is needed")
    }

    const subs = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $replaceRoot: {
                newRoot: { $first: "$subscriberDetails" }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1
            }
        }
    ])
    return res 
    .status(200)
    .json(new ApiResponse(
        200,
        subs,
        "All subscribers fetched successfully"
    ))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}