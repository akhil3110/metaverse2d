import { json, Router } from "express";
import { createSpaceSchema, addElementSchema, deleteElementSchema } from "../../types/index.js";
import client from "@repo/db/client"
import {userMiddleware} from "../../middleware/user.js"

export const spaceRouter = Router()


spaceRouter.post("/",userMiddleware, async(req,res) =>{
    const parsedData = createSpaceSchema.safeParse(req.body)

    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(400).json({message: "Validation failed"})
        return
    }

    if (!parsedData.data.mapId) {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0]),
                height: parseInt(parsedData.data.dimensions.split("x")[1]),
                creatorId: req.userId!
            }
        });
        res.json({spaceId: space.id})
        return;
    }

    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId
        },
        select: {
            mapElements: true,
            height: true,
            width: true
        }
    })

    if(!map){
        res.status(400).json({
            message: "Map not found"
        })
    }

    await client.$transaction(async() =>{
        const space = await client.space.create({
            data:{
                name: parsedData.data.name,
                width: map?.width!,
                height: map?.height,
                creatorId: req.userId!
            }
        })

        await client.spaceElements.createMany({
            //@ts-ignore
            data: map?.mapElements.map((e) =>({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        })

        res.json({spaceId: space.id})
        return space
    })
    
})

spaceRouter.delete("/:spaceId",userMiddleware,async(req,res) =>{
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId
        },
        select: {
            creatorId: true
        }
    })

    if(!space){
        res.status(400).json({
            message: "space not found"
        })
        return
    }
    if(space?.creatorId !== req.userId){
        res.status(403).json({
            message: "UnAuthorized"
        })
        return
    }

    await client.space.delete({
        where: {
            id: req.params.spaceId
        }
    })

    res.json({
        message: "Space deleted"
    }).status(200)
    return
})

spaceRouter.get("/all",userMiddleware, async(req,res) =>{
    const spaces = await client.space.findMany({
        where: {
            creatorId: req.userId
        }
    })

    res.json({
        spaces: spaces.map(s =>({
            id: s.id,
            name: s.name,
            dimenssions: `${s.width}x${s.height}`,
            thumbnail: s.thumbnail
        }))
    }).status(200)
})

spaceRouter.post("/element",userMiddleware ,async(req,res) =>{
    const parsedData = addElementSchema.safeParse(req.body)

    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(400).json({message: "Validation failed"})
        return
    }

    const space = await client.space.findUnique({
        where:{
            id: req.body.spaceId,
            creatorId: req.userId
        },
        select:{
            width: true,
            height: true
        }
    })

    if(!space){
        res.status(400).json({
            message: "Space not found"
        })
        return
    }

    await client.spaceElements.create({
        data:{
            spaceId: req.body.spaceId,
            elementId: req.body.elementId,
            x: req.body.x,
            y: req.body.y
        }
    })

    res.json({
        message: "Element added"
    })
})

spaceRouter.delete("/element",userMiddleware ,async(req,res) =>{
    const parsedData = deleteElementSchema.safeParse(req.body)

    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(400).json({message: "Validation failed"})
        return
    }

    const spaceElement = await client.spaceElements.findUnique({
        where:{
            id: parsedData.data.id,
        },
        include: {
            space: true
        }
    })

    if(!spaceElement?.space.creatorId || spaceElement.space.creatorId !==req.userId){
        res.status(403).json({
            message: "UnAuthorized"
        })
        return
    }

    await client.spaceElements.delete({
        where: {
            id: parsedData.data.id
        }
    })

    res.json({
        message: "Element Deleted"
    })
})

spaceRouter.get("/:spaceId", async(req,res) =>{
   
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId
        },
        include: {
           elements: {
                include: {
                    element: true
                }
           },

        }
    })

    if (!space) {
        res.status(400).json({message: "Space not  found"})
        return
    }

    res.json({
        dimensions: `${space.width}x${space.height}`,
        elements: space.elements.map(e =>({
            id: e.id,
            element: {
                id: e.element.id,
                imgeUrl: e.element.imageUrl,
                width: e.element.width,
                hieght: e.element.height,
                static: e.element.static
            },
            x: e.x,
            y: e.y
        })),
    })
      
})