import express from "express";
import cors from "cors";
import dotenv from 'dotenv'
import userRouter from './routes/user.routes.js'
import toolsRouter from './routes/tools.routes.js'
import cookieParser from "cookie-parser";
import  {connectDB}  from "./db/db.js";
const app = express();
app.use(cors());
app.use(express.json())
app.use(cookieParser())
dotenv.config()
app.use(express.urlencoded({extended:true}))
await connectDB()
app.use("/users",userRouter)
app.use("/tools",toolsRouter)

app.listen(3000, () => {
  console.log("Server is runing ");
});
