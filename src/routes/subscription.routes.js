import express from "express";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controllers.js";

const subscriptionRouter = express.Router();

subscriptionRouter.route("/subscriber/:channelId")
.post(
    verifyJWT,
    toggleSubscription
)
.get(
    verifyJWT,
    getUserChannelSubscribers
);

subscriptionRouter.route("/channel/:subscriberId")
.get(
    verifyJWT,
    getSubscribedChannels
);

export default subscriptionRouter;