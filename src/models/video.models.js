import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number, // From Cloudinary
            required: true
        },
        views: {
            type: Number,
            required: true,
            default: 0
        },
        isPublished: {
            type: Boolean,
            required: true,
            default: true
        },
    }, { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate); // Used to use the real power of the mongoose with this we use aggregate functions.

export const Video = mongoose.model("Video", videoSchema);