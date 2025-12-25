import express from "express";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playList.controllers.js"

const playlistRouter = express.Router();

playlistRouter.route("/")
.post(
    verifyJWT,
    createPlaylist
);

playlistRouter.route("/user/:userId")
.get(
    getUserPlaylists
);

playlistRouter.route("/:playlistId")
.get(
    getPlaylistById
);

playlistRouter.route("/:playlistId/videos/:videoId")
.post(
    verifyJWT,
    addVideoToPlaylist
);

playlistRouter.route("/:playlistId/videos/:videoId")
.delete(
    verifyJWT,
    removeVideoFromPlaylist
);

playlistRouter.route("/:playlistId")
.delete(
    verifyJWT,
    deletePlaylist
);

playlistRouter.route("/:playlistId")
.patch(
    verifyJWT,
    updatePlaylist
);

export default playlistRouter;