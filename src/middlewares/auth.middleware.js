import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id).select(
            "-password -refreshToken"
        )

        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user
        next() // helps to go to next middleware if we have more than one 

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }


})