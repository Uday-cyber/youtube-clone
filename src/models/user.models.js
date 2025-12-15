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
        required: true, 
        unique: true, 
        index: true,
        trim: true,
        minLength: 4
    },
    email: { 
        type: String, 
        required: true,
        unique: true, 
        lowercase: true,
        trim: true, 
    },
    fullName: { 
        type: String, 
        required: true,
        trim: true 
    },
    avatar: { 
        type: String // Cloudinary Url
    },
    coverImage: { 
        type: String // Cloudinary Url
    },
    password: {
      type: String,
      required: true,
      min: 8,
      select: false
    },
    refreshToken: { 
        type: String 
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return;

   this.password = await bcrypt.hash(this.password, 10);
//    next(); 
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
