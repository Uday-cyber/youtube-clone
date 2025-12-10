import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    watchHistory: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Video" 
        }
    ],
    username: { 
        type: String, 
        required: [true, "username is required"], 
        unique: true, 
        index: true 
    },
    email: { 
        type: String, 
        required: [true, "email is required"], 
        unique: true, 
        lowercase: true 
    },
    fullName: { 
        type: String, 
        required: [true, "email is required"] 
    },
    avatar: { 
        type: String // Cloudinary Url
    },
    coverImage: { 
        type: String // Cloudinary Url
    },
    password: {
      type: String,
      required: [true, "password is required"],
      min: [8, "Minimum 8 characters are required"],
    },
    refreshToken: { 
        type: String 
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

   this.password = bcrypt.hash(this.password, 10);
   next(); 
});
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.SECRET_ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.SECRET_REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);
