import express from "express";
import { config } from "dotenv";
import { connection } from "./config/db.js";
import tradeRoute from "./routes/tradeRoute.js"
import userRoute from "./routes/userRoute.js"
import inventoryRoute from "./routes/inventoryRoute.js"
import cargoRoute from "./routes/cargoRoute.js"
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();
config({path:"./.env"})
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


connection();
app.use(express.json())
app.use(cookieParser())



app.use('/api', tradeRoute)
app.use('/api', userRoute)
app.use('/api', cargoRoute)
app.use('/api', inventoryRoute)


app.use(errorMiddleware)

export default app;