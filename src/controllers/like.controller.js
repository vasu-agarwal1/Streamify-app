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
    const userId = req.user?._id;
    
    if (!userId) {
        throw new ApiError(404, "User is not logged in");
    }

    const likedVideos = await Like.aggregate([
        // 1. Find likes by this user
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
            }
        },
        // 2. Fetch the Video
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo"
            }
        },
        // 3. Unwind (BUT keep the like even if video is missing, for debugging)
        {
            $unwind: {
                path: "$likedVideo",
                preserveNullAndEmptyArrays: false // Set true if you want to see broken likes
            }
        },
        // 4. Make the Video the "Root" document
        // Now the document structure looks exactly like the Home Feed!
        {
            $replaceRoot: { newRoot: "$likedVideo" }
        },
        // 5. Fetch the Owner (Standard Feed Logic)
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        // 6. Project specific fields for the Card
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                views: 1,
                duration: 1,
                createdAt: 1,
                isPublished: 1,
                owner: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}