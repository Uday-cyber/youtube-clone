import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`Database connected on host: ${connect.connection.host}`);
    } catch (error) {
        console.error('Database connection error', error);
    }
}

export default connectDB;