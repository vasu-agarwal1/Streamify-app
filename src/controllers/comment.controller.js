import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup : {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            }
        },
        {
            // Stage 3: "Promote" the owner's details. $first gets the single user object from the array.
            $addFields: {
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner.username" : 1,
                "owner.avatar" : 1,
                "owner._id" : 1
            }
        }
    ]

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const getAllComments = await Comment.aggregatePaginate(pipeline, options)


    if (!getAllComments) {
        throw new ApiError(500, "Failed to fetch comments");
    }

    return res
    .status(200)
    .json(new 
        ApiResponse(
            200,
          getAllComments,
          "All the comments fetched Successfully"
    ))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params
    if(!content || content.trim() == ""){
        throw new ApiError(400, "Please give content")
    }

    const newComment = await Comment.create({
        owner: req.user?._id,
        video: videoId,
        content: content
    })
    if (!newComment) {
        throw new ApiError(404, "Error in createng new commentin DB")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, newComment, "New comment added"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {newContent} = req.body

    if(!newContent || newContent.trim() == ""){
        throw new ApiError(400, "Please give content")
    }

    const newComment  = await Comment.findOneAndUpdate(
        {
        _id: commentId,
        owner: req.user?._id
      },
      {
        $set: {
            content: newContent
        }
      },
      {new: true}

    )

if (!newComment) {
        throw new ApiError(404, "Error in updating new commentin DB")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, newComment, "comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const comment = await Comment.findOneAndDelete(
        {
            _id : commentId,
            owner: req.user?._id
        }
    )

    if (!comment) {
        throw new ApiError(400, "unauthorized access or Error while deleting in database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {} ,"Comment Successfully Deleted"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }