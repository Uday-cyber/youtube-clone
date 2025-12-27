import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controllers.js";

const dashboardRouter = express.Router();

dashboardRouter.route("/:channelId/home")
.get(
    verifyJWT,
    getChannelStats
);

dashboardRouter.route("/:channelId/videos")
.get(
    verifyJWT,
    getChannelVideos
);

export default dashboardRouter;