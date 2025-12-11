import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if (!content) {
        throw new ApiError(400,"Type your tweet")
    }

    const owner = req.user?._id

    if (!owner) {
        throw new ApiError(400, "User don't exist")
    }

    const tweet = await Tweet.create(
        {
            content,
            owner
        }
    )

    if(!tweet){
        throw new ApiError(400, "there is some problem while creating tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "New tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user = req.params.userId

    const tweet = await Tweet.find(
        {
            owner: user
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "All tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const{content} = req.body

    const user = req.user?._id

    if (!content) {
        throw new ApiError(400,"Give the content!!")
    }

    const currTweet = req?.params.tweetId

    // if (user.toString() !== currTweet.owner.toString()) {
    //     throw new ApiError(400,"Unauthorized Request")
    // }

    const tweet = await Tweet.findOneAndUpdate(
        {// compares both the fields
            _id : currTweet,
            owner : user
        },
        {// updating the tweet
            $set: {
                content
            }
        },
        { new : true }
    )

    if (!tweet) {
        throw new ApiError(400,"Error while fetching tweet from DB")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet is updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const currTweet = req.params.tweetId
    if (!currTweet) {
        throw new ApiError(400, "No tweet Exists")
    }

    const tweet = await Tweet.findOneAndDelete(
        {
            _id : currTweet,
            owner : req.user?._id
        }
    )

    if (!tweet) {
        throw new ApiError(400, "unauthorized access or Error while deleting in database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet Successfully Deleted"))
})


const getAllTweets = asyncHandler(async (req, res) => {
    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const tweets = await Tweet.aggregate([
        {
            $sort: {
                createdAt: -1 
            }
        },
        
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        },
    
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
    
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [currentUserId, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        
        {
            $project: {
                likes: 0
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});



export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}