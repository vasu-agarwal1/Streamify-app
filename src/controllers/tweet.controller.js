import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if (!content) {
        throw new ApiError(400,"Type you tweet")
    }

    const owner = await User.findById(req.user?._id)

    if (!owner) {
        throw new ApiError(400, "User don't exist")
    }

    const tweet = await Tweet.create(
        {
            content,
            owner
        }
    )
    const createdTweet = await Tweet.findById(tweet._id)

    if(!createdTweet){
        throw new ApiError(400, "there is some problem while creating tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, createdTweet, "New tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}