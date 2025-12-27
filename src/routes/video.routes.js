import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const videoRouter = express.Router();

videoRouter.route("/")
.get(
    verifyJWT,
    getAllVideos 
)
.post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1}
    ]),
    publishAVideo
)

videoRouter.route("/:videoId")
.get(
    verifyJWT,
    getVideoById
)
.patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateVideo
)
.delete(
    verifyJWT,
    deleteVideo
)

videoRouter.route("/:videoId/toggle-status")
.post(
    verifyJWT,
    togglePublishStatus
)

export default videoRouter;
