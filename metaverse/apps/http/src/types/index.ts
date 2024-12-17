import z from "zod";

export const signupSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8),
    type: z.enum(["user", "admin"])
})

export const signInSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8),
})

export const updateMetaSchema = z.object({
    avatarId: z.string()
})

export const createSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId: z.string()
})

export const addElementSchema = z.object({
    spaceId: z.string(),
    elementId: z.string(),
    x: z.number(),
    y: z.number(),
})

export const deleteElementSchema = z.object({
    id: z.string()
})

export const createElementSchema = z.object({
    imageUrl: z.string(),
    elementId: z.string(),
    width: z.number(),
    hieght: z.number(),
    static: z.boolean()
})

export const updateElementSchema = z.object({
    imageUrl: z.string(),
})

export const createAvatarSchema = z.object({
    name: z.string(),
    imageUrl: z.string()
})

export const createMapSchema = z.object({
    name: z.string(),
    thumbnail: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number()
    }))
})


declare global {
    namespace Express {
        export interface Request{
            userId?: string
            role?: "Admin" | "User"
        }
    }
}

