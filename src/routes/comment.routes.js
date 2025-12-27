import express from "express";

import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controllers.js";

const commentRouter = express.Router();

commentRouter.route("/video/:videoId/comments")
.get(
    verifyJWT,
    getVideoComments
)
.post(
    verifyJWT,
    addComment
)

commentRouter.route("/video/:videoId/comments/:commentId")
.patch(
    verifyJWT,
    updateComment
)
.delete(
    verifyJWT,
    deleteComment
)

export default commentRouter;
