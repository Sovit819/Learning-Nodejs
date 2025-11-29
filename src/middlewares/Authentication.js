import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async(req, res, next)=>{
    const authHeader = req.header("Authorization") || req.header("authorization");

    const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : authHeader;

    if(!token){
        throw new ApiError(401, "Unauthorized - No token provided")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(401, "Invalid access token - User not found")
    }

    if(!user.isActive){
        throw new ApiError(401, "Account is deactivated");
    }

    req.user = user;
    next();
})