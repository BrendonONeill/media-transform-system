import Express from 'express'
import upload from '../utils/multer.js'
import fs from "node:fs"

const app = Express()



app.use("/test", upload.single("file"), (req, res) => {
 console.log(req.file)
 const writeStream = fs.createWriteStream("./main.mkv");
 req.pipe(writeStream)
 res.json("hello myself")
})

app.listen("3000",() => {
    console.log(`server running on 3005`)
})