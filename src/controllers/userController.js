import User from '../models/user.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { mongo } from 'mongoose';

// Controller to create a new user
export const createUser = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        age,
        role
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, "User already exists with this email");
    }

    const newUser = await User.create({
        name,
        email,
        password,
        age,
        role
    });

    const userWithoutPassword = await User.findById(newUser._id).select('-password');

    return res
        .status(201)
        .json(new ApiResponse(201, userWithoutPassword, "User created successfully"));


});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');

    if (users.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, users, "No users found"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
})

// Get single user
export const getUserById = asyncHandler(async (req, res) => {
    const userId = req.params._id || req.params.id;
    let user;

    try {
        user = await User.findById(req.params._id).select("-password")
    } catch (error) {
        if (error instanceof mongo.Error.CastError) {
            throw new ApiError(400, "Invalid user ID format")
        }
        throw error;
    }

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"))
})

// Update user
export const updateUser = asyncHandler(async (req, res) => {
    const userId = req.params._id || req.params.id;
    let user;

    try {
        user = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true,
        }).select("-password");
    } catch (error) {
        if (error instanceof mongo.Error.CastError) {
            throw new ApiError(400, "Invalid user ID format")
        }
        throw error;
    }

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User updated successfully"))
});

// Delete user
export const softDeleteUser = asyncHandler(async (req, res) => {
    const userId = req.params._id || req.params.id;
    let user;

    try {
        user = await User.findByIdAndUpdate(userId,
            { isActive: false, deletedAt: new Date() },
            { new: true, runValidators: true }
        ).select("-password");
    } catch (error) {
        if (error instanceof mongo.Error.CastError) {
            throw new ApiError(400, "Invalid user ID format")
        }
        throw error;
    }
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User deactivated successfully"))
});

export const hardDeleteUser = asyncHandler(async (req, res) => {
    const userId = req.params._id || req.params.id;

    let user;
    try {
        user = await User.findByIdAndDelete(userId).select("-password");
    }catch(error){
        if (error instanceof mongo.Error.CastError) {
            throw new ApiError(400, "Invalid user ID format")
        }
        throw error;
    }

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User permanently deleted."));
});

// Login
export const loginUser = asyncHandler( async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({email}).select("+password");

    if(!user || !(await user.matchPassword(password))){
        throw new ApiError(401, "Invalid email or password");
    }

    if(!user.isActive){
        throw new ApiError(403, "Account is deactivated");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite : "strict",
        maxAge: 7*24*60*60*1000
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, {user:loggedInUser, accessToken}, "Login successful"));
})

// logout
export const logoutUser = asyncHandler(async(req, res)=> {
    const user = await User.findByIdAndUpdate(req.user._id,
        {$set: {refreshToken: null}},
        {new: true}
    )

    const options ={
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    }

    return res
    .status(200)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})