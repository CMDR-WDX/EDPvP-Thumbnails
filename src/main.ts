// entry point. 
// we could make use of express here, but that would imo be
// overkill. A simple "native" HTTP Server works perfectly.

import http from "node:http"
import {parse} from "node:querystring"
import { z } from "zod"
import generateVector from "./generateVector.js"
import { join } from "node:path"
import sharp from "sharp"
import { Resvg } from "@resvg/resvg-js"
import { fileURLToPath } from "node:url"


const __dirname = fileURLToPath(new URL('.', import.meta.url))


const images = Object.keys(import.meta.glob("../images/*.(png|jpg|jpeg)", {eager: true, query: "url"})).map( e =>  join(__dirname, "..", e))


const PropsZod = z.object({
    attacker: z.string(),
    victim: z.string(),
    attackerShip: z.string().optional(),
    victimShip: z.string().optional(),
    system: z.string().optional()
})

export type Props = z.infer<typeof PropsZod>


const port = process.env.PORT || 8080

http.createServer(async(req, res) => {
    
    try {
        const data = Object.fromEntries(Object.entries(parse(req.url!.split("/").pop()!)).map(([k,v]) => [k.replace("?", ""), v]))
        const parsedData = PropsZod.parse(data)

        const vectorBuffer = await generateVector(parsedData)


        const vectorAsPng = (new Resvg(vectorBuffer)).render().asPng()
        const imagePath = images[Math.floor(Math.random()*images.length)]
        let composite = sharp(imagePath)
            .resize({width: 1200, height: 400, fit: "cover"})
            .blur()
            .composite([{ input: vectorAsPng}])

        res.setHeader("content-type", "image/webp")
        res.write(await composite.webp().toBuffer())
        
    }
    catch(err) {
        res.statusCode = 400
        res.write(err+"")
        
    }
    finally {

        res.end()
    }
    


}).listen(port, () => console.log("Thumbnail Server running on :"+port))