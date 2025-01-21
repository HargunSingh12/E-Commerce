import express from "express"
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";

configDotenv()
const app = express();
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())
app.use('/api/auth',authRoutes)

app.listen(PORT,()=>{
    console.log("Server is running on port 5000");
    connectDB()
})