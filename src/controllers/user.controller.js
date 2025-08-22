import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


//we have created a method to generate tokens so that we do not have to do it again and again
const generateAccessAndRefereshTokens =async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user detail
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token fields from res
    // check for user creation
    // return res

    //step1
    const {fullName, username, email, password } =req.body


    // if(fullName === ""){
    //     throw new ApiError(400, "Fullname is required")
    // }
    // instead of checking for every value one by one we can use =>

        //step 2
        if (
            [fullName, email, username, password].some((field) => 
            field?.trim() === "")//if this condition is true
        ) {
            throw new ApiError(400, "All fields are required")
        }

        //step 3
        const existedUser = await User.findOne({
            $or: [{ email }, { username }]
        })

        if (existedUser) {
            throw new ApiError(409, "User already Exists!!")
        }

        //step 4
        const avatarLocalPath = req.files?.avatar[0]?.path
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0) {
          coverImageLocalPath = req.files.coverImage[0].path 
        }
        
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }

        //step 5
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
            throw new ApiError(400, "Avatar file is Required")
        }

        // step 6
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        // step 7
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        // step 8
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        // step 9
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User Registered Successfully")
        )

})

const loginUser =asyncHandler( async (req, res) => {
    //get user details (email , password)
    //verify email and password from database
    // if it's correct generate tokens(both)
    // if the email is ot registered ask user to register
    //

    //req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const {email , username, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required!!")
    }

    const user = await User.findOne({
        $or: [
            {email},
            {username}
        ]
    })

    if (!user) {
        throw new ApiError(404, "user don't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credentials")
    }

    const {accessToken, refreshToken} = await 
    generateAccessAndRefereshTokens(user._id) 

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User loggedin successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedout successfully"))
}) 


export {
    registerUser,
    loginUser,
    logoutUser
}