import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import

import userRouter from "./routes/user.routes.js"
import tweetRouter from "./routes/tweet.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)// here /users is telling url to go to userRouter 
app.use("/api/v1/tweets", tweetRouter)


export { app }