import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router()


router.route("/register").post(
   // this is middleware ye route pe jo method ke pehle bichme 
//    injecting middleware
    upload.fields([
        {
            name:"avatar",
            maxCount:1,

        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

export default router