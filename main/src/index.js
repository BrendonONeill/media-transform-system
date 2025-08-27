import Express from "express"
import fs from "node:fs"
import 'dotenv/config'
import cors from 'cors';

const app = Express()

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*']
}));

app.use("/abc", async (req,res) => {
    // temp thinking
     try {
        const a = await fetch("http://localhost:3007/hello", {method:"POST", body:JSON.stringify({name:"fred"}), headers: {
        'Content-Type': 'application/json',
      }})
    } catch (error) {
        console.log(error)
    }
    
    res.json("sleep")
})

app.use("/videoreturn", (req, res) => {
 console.log("i'm being called")
 const writeStream = fs.createWriteStream(`videos/${req.headers['x-original-filename']}`);
 req.pipe(writeStream)
 writeStream.on("finish", () => {
  res.json("success")
 })
 writeStream.on("error", () => {
  res.json("error")
 })
 
})

app.use("/test", async (req,res) => {
    // temp thinking
    let path = process.env.FILE_PATH
    const readStream = fs.createReadStream(path);
    const stats = fs.statSync(path);
    const fileName = readStream.path.split("\\")[3]
    console.log("Called-----")
    try {
        const a = await fetch("http://localhost:3007/", {method:"POST", body:readStream, headers: {
        'Content-Type': 'video/mkv',
        'Content-Length': stats.size.toString(),
        'X-Original-Filename': fileName
      },duplex: 'half'})
    } catch (error) {
        console.log(error)
    }

    let path2 = process.env.FILE_PATH2
    const readStream2 = fs.createReadStream(path2);
    const stats2 = fs.statSync(path2);
    const fileName2 = readStream2.path.split("\\")[3]
    console.log("Called-----")
    try {
        const a = await fetch("http://localhost:3007/", {method:"POST", body:readStream2, headers: {
        'Content-Type': 'video/mkv',
        'Content-Length': stats2.size.toString(),
        'X-Original-Filename': fileName2
      },duplex: 'half'})
    } catch (error) {
        console.log(error)
    }

    res.json("sleep")
})




app.listen("3000", () => {
    console.log("app listening on 3000")
})