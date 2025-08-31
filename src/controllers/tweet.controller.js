import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


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

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}