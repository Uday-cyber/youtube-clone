import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Routes
import userRouter from './routes/user.routes.js';
import commentRouter from './routes/comment.routes.js';
import likeRouter from './routes/like.routes.js';
import playlistRouter from './routes/playlist.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import healthcheckRouter from './routes/healthcheck.routes.js';

app.use("/api/v1/user", userRouter); //Standard Practice u have to declare the api/version if you are creating API
app.use("/api/v1/videos", commentRouter); 
app.use("/api/v1/likes", likeRouter); 
app.use("/api/v1/playlists", playlistRouter); 
app.use("/api/v1/subscription", subscriptionRouter); 
app.use("/api/v1/tweets", tweetRouter); 
app.use("/api/v1/healthcheck", healthcheckRouter); 

//Error Middleware
import errorMiddleware from "../src/middlewares/error.middlewares.js";

app.use(errorMiddleware);

export default app;