import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECERET } from "../config.js";

export const userMiddleware = (req: Request,res: Response,next: NextFunction) =>{
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1]

    if(!token){
        res.status(403).json({
            message: "Unauthorized"
        })
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_SECERET) as { role: string, userId: string}
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(401).json({
            message: "UnAuthorized"
        })
        return
    }
}