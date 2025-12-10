import dotenv from 'dotenv';
import connectDB from './db/db.js';
import app from './app.js';

dotenv.config({
    path: './env'
});

connectDB()
.then( () => {
    app.on("err", (error) => {
        console.log("ERR: ", error);
    });
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port: ${process.env.PORT}`);
    });
})
.catch( (err) => {
    console.log("Database connection failed!", err);
})