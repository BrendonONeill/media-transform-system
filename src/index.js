import Express from "express"
import fs from "node:fs"
import 'dotenv/config'

const app = Express()


app.use("/", async (req,res) => {
    // temp thinking
    let path = process.env.FILE_PATH
    const readStream = fs.createReadStream(path);
    const fileName = readStream.path.split("\\")[3]
    try {
        const a = await fetch("http://localhost:3005/test", {method:"POST", body:readStream, headers:{'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="${fileName}"`}})
    } catch (error) {
        
    }
    res.json("sleep")
})


app.listen("3000", () => {
    console.log("app listening on 3000")
})