import { asyncHandler } from "../middlewares/aysncHandler.js";
import { sendToken } from "../utils/jwtToken.js";
import { User } from "../models/user.model.js";
import ErrorHandler from "../middlewares/error.js";

export const register = asyncHandler(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !password || !email) {
            return next(new ErrorHandler("all fields are required while registering user", 400));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler("Email is already registered.", 400));
        }

        const user = await User.create({
            name, email, password
        });
        sendToken(user, 201, res, "User Registered.");
    } catch (error) {
        next(error);
    }
})

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("email and password both are required", 400));
    }

    const user = await User.findOne({ email })

    if (!user) {
        return next(new ErrorHandler("email not found", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password.", 400));
    }

    sendToken(user, 200, res, "User logged in successfully.");
})

export const logout = asyncHandler(async (req, res, next) => {
    res
        .status(200)
        .cookie("token", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        .json({
            success: true,
            message: "Logged out successfully.",
        });
});

export const getUser = asyncHandler(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully."
    });
});
