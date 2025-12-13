import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"






const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400,"Enter both title and description")
    }

    const videoLocalPath = req.files?.videoFile[0].path
    const thumbnailLocalPath = req.files?.thumbnail[0].path

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400,"both the files are required!!")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Error while uploading on cloudinary")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user?._id

    })

    if (!video) {
        throw new ApiError(500,"something went wrong while publishing the video")
    }

    return res.status(201)
    .json(new ApiResponse(200, video, "Video Successfully published"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    

    if (!videoId) {
        throw new ApiError(400, "Please provide video id");
    }

   

    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    if(userId){
        const user = await User.findById(userId)

        const isAlreadyWatched = user.watchHistory.includes(videoId)

        if(!isAlreadyWatched){
            await Video.findByIdAndUpdate(videoId, {
                $inc: { views: 1 }
            })

            await User.findByIdAndUpdate(userId, {
                $push: { watchHistory: videoId }
            })
        }
    }

    const videoAggregate = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner", 
                foreignField: "channel",
                as: "subscribers"
            }
        },
        
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
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
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                owner: { $first: "$owner" },
                isLiked: {
                    $cond: {
                        if: { $in: [userId, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [userId, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                },
               
            }
        },
        {
            $project: {
                likes: 0,
                subscribers: 0 
            }
        }
    ]);

    const video = videoAggregate[0];

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const{title, description} = req.body

    const updateFields = {}//created an empty object to store on fields which are updated

     if (title) {
        updateFields.title = title
     }
     if (description) {
        updateFields.description = description
     }

    

    if (req.file) {
        const thumbnailLocalPath = req.file.path  
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if (!thumbnail) {
            throw new ApiError(400, "Error while uploading on cloudinary")
        }

        updateFields.thumbnail = thumbnail?.url
    }

    

    const video = await Video.findOneAndUpdate({
        _id : videoId,
        owner : req.user?._id
    },
    {
        $set: updateFields
    },
    {new: true}
)

if (!video) {
        throw new ApiError(404,"Error while fetching video from DB")
    }

return res.status(200)
.json(new ApiResponse(200,video, "Data Updated Successfully!!"))

})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(400, "No tweet Exists")
    }

    const video = await Video.findOneAndDelete(
        {
            _id: videoId,
            owner: req.user?._id
        }
    )
    
     if (!video) {
        throw new ApiError(404, "unauthorized access or Error while deleting in database")
    }

     return res
    .status(200)
    .json(new ApiResponse(200,{}, "Video Successfully Deleted"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Error in DB")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"Unauth access")
    }

    video.isPublished = !video.isPublished

    await video.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,video , "Status Updated"))
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pipeline = []

    if(userId){//filter by user
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

        
   if(query){// filter by text search
    pipeline.push({
        $match: {
            $or: [
                {"title":{$regex: query , $options: 'i'}},
                {"description":{$regex: query , $options: 'i'}}
            ]
        }
    })
   }
   pipeline.push({
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
    })

    pipeline.push({
        $unwind: "$owner"
    })

   if (sortBy) {
    const sortOrder = sortType === 'desc' ? -1: 1 // sortType tells either desc or asc
    pipeline.push({
        $sort: {
            [sortBy]: sortOrder //in modern js this [] braket will put exact value of sortBy eg. views
        }
    })
   }

   const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
   }

   const video = await Video.aggregatePaginate(pipeline, options)

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
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}