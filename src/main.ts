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
import { createHash } from "node:crypto"

const __dirname = fileURLToPath(new URL('.', import.meta.url))



const images = Object.keys(import.meta.glob("../images/*.(png|jpg|jpeg)", {eager: true, query: "url"})).map( e =>  join(__dirname, e))

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
        const params = req.url!.split("?").pop()!
        const data = parse(params)
        const parsedData = truncate(PropsZod.parse(data))

        const vectorBuffer = await generateVector(parsedData)


        const vectorAsPng = (new Resvg(vectorBuffer)).render().asPng()
        const imagePath = pickBackgroundImage(parsedData)
        let composite = sharp(imagePath)
            .resize({width: 1200, height: 400, fit: "cover"})
            .blur()
            .composite([{ input: vectorAsPng}])

        res.setHeader("content-type", "image/png")
        res.write(await composite.png().toBuffer())
        
    }
    catch(err) {
        res.statusCode = 400
        res.write(err+"")
        
    }
    finally {

        res.end()
    }
    


}).listen(port, () => console.log("Thumbnail Server running on :"+port))


function pickBackgroundImage(parsedData: Props) {
    const hash = createHash("md5").update(JSON.stringify(parsedData)).digest("hex")
    const number = parseInt("0x"+hash.substring(0, 5))
    return images[number % images.length]
}


function truncate(parsedData: Props) : Props {
    if(parsedData.attacker.length > 21) {
        parsedData.attacker = parsedData.attacker.substring(0, 20)+"..."
    }
    if(parsedData.victim.length > 21) {
        parsedData.victim = parsedData.victim.substring(0, 20)+"..."
    }
    if(parsedData.system && parsedData.system.length > 60) {
        parsedData.system = parsedData.system.substring(0, 58)+"..."
    }
    return parsedData;
}
