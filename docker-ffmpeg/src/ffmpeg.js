import Express from 'express'
import upload from '../utils/multer.js'
import fs from "node:fs"
import { main } from '../utils/ffmpeg.js'
import cors from 'cors';

const app = Express()
// Built-in JSON parser
app.use(Express.json());

// Built-in URL-encoded parser
app.use(Express.urlencoded({ extended: true }));

app.use('/store-video', Express.raw({ 
  type: 'video/*', 
  limit: '5gb' // Adjust based on your video size limits
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*']
}));

app.use("/hello", (req, res) => {
 console.log("test link")
 res.json("success")
})

app.use("/", (req, res) => {
 console.log("i'm being called")
 const writeStream = fs.createWriteStream(`temp/${req.headers['x-original-filename']}`);
 req.pipe(writeStream)
 writeStream.on("finish", () => {
  main(req.headers['x-original-filename'])
  res.json("success")
 })
 writeStream.on("error", () => {
  res.json("error")
 })
 
})


app.listen("3007",() => {
    console.log(`server running on 3007`)
})