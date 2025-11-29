import mongoose, { mongo } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [50, "Name can not be more than 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
            index: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 8 characters"],
            select: false,
            validate: [
                {
                    validator: function (value) {
                        return /[a-z]/.test(value);
                    },
                    message: "Password must contain at least one lowercase letter"
                },
                {
                    validator: function (value) {
                        return /[A-Z]/.test(value);
                    },
                    message: "Password must contain at least one uppercase letter"
                },
                {
                    validator: function (value) {
                        return /[0-9]/.test(value);
                    },
                    message: "Password must contain at least one digit"
                },
                {
                    validator: function (value) {
                        return /[!@#$%^&*()]/.test(value);
                    },
                    message: "Password must contain at least one special character (!@#$%^&*())"
                },
            ]
        },
        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [14, "Age must be at least 14"],
        },
        role: {
            type: String,
            enum: ["user", "manager", "admin"],
            default: "user"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        image: {
            type: String
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.generateAccessToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
 }

const User = mongoose.model("User", userSchema);

export default User;
