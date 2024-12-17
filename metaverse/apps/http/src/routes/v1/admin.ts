import { Router } from "express";
import client from "@repo/db/client"
import { adminMiddleware } from "../../middleware/admin.js";
import { addElementSchema, createAvatarSchema, createElementSchema, createMapSchema, updateElementSchema } from "../../types/index.js";

export const adminRouter = Router()

adminRouter.post("/element",adminMiddleware ,async(req,res) =>{
    const parseData = createElementSchema.safeParse(req.body)

    if(!parseData){
        res.status(400).json({
            message: "Validation failed "
        })
        return
    }

    const element = await client.element.create({
        data: {
            width: parseData.data?.width!,
            height: parseData.data?.hieght!,
            static: parseData.data?.static!,
            imageUrl: parseData.data?.imageUrl!
        }
    })

    res.json({
        id: element.id
    })
})

adminRouter.put("/element/:elementId",adminMiddleware, async(req,res) =>{
    const parsedData = updateElementSchema.safeParse(req.body)

    if(!parsedData){
        res.status(400).json({
            message: "Validation failed "
        })
        return
    }


    client.element.update({
        where: {
            id: req.params.elementId
        },
        data: {
            imageUrl: parsedData.data?.imageUrl
        }
    })

    res.json({
        message: "Element updated"
    })
})

adminRouter.post("/avatar",adminMiddleware, async(req,res) =>{
    const parsedData = createAvatarSchema.safeParse(req.body)

    if(!parsedData){
        res.status(400).json({
            message: "Validation failed "
        })
        return
    }

    const avatar = await client.avatar.create({
        data: {
            name: parsedData.data?.name,
            imageUrl: parsedData.data?.imageUrl,
            userId: req.userId!
        }
    })

    res.json({
        id: avatar.id
    })
})

adminRouter.post("/map",adminMiddleware, async(req,res) =>{
    const parsedData = createMapSchema.safeParse(req.body)

    if(!parsedData){
        res.status(400).json({
            message: "Validation failed "
        })
        return
    } 


    const map =  await client.map.create({
        data: {
            name: parsedData.data?.name!,
            width: parseInt(parsedData.data?.dimensions.split("x")[0]!),
            height: parseInt(parsedData.data?.dimensions.split("x")[1]!),
            thumbnail: parsedData.data?.thumbnail!,
            mapElements: {
                create: parsedData.data?.defaultElements.map(e =>({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                }))
            }
        }
    })

    res.json({
        message: map.id
    })
}) 