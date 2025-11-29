// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running at port", process.env.PORT || 3000);
    })
})
.catch((error) => {
    console.log("Mongodb Connection failed", error)
})



