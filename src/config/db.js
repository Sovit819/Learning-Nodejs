import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";


const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`Successfully connected to MongoDB Atlas via Mongoose`);
    }catch(error){
        console.error("Error connecting to MongoDB Atlas:", error);
        process.exit(1);
    }
}

export default connectDB;