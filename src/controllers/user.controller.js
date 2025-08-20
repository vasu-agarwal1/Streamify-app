import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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

    const {fullName, username, email, password } =req.body
    console.log("email: ", email);

    // if(fullName === ""){
    //     throw new ApiError(400, "Fullname is required")
    // }
    // instead of checking for every value one by one we can use =>

        if (
            [fullName, email, username, password].some((field) => 
            field?.trim() === "")//if this condition is true
        ) {
            throw new ApiError(400, "All fields are required")
        }

        const existedUser = User.findOne({
            $or: [{ email }, { username }]
        })

        if (existedUser) {
            throw new ApiError(409, "User already Exists!!")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path
        console.log(files)
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
            throw new ApiError(400, "Avatar file is Required")
        }

        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User Registered Successfully")
        )

})


export {registerUser}