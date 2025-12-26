import express from "express";
import { healthcheck } from "../controllers/healthcheck.controllers.js";

const healthcheckRouter = express.Router();

healthcheckRouter.route("/").get(healthcheck);

export default healthcheckRouter;