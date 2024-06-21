import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// config cors
app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials:true
}))
// config app for various types of data our backend will receive
// for json data settings Limit (security practise)
app.use(express.json({limit:"16kb"}))

// for URL data 
app.use(express.urlencoded({extended:true,limi:"16kb"}))

// static asseets --> like pdf , images etc for public assets anyone can access
app.use(express.static("public"))

// to accept user cookies and perform crud ops in user browser

app.use(cookieParser())




export { app }