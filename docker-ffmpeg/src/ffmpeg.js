import Express from 'express'
import fs from "node:fs"
import cors from 'cors';
import {generationFile} from '../utils/createFile.js'

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

app.use("/finishedUpload",(req, res) => {
  let fileInformation = req.body
  generationFile(fileInformation)

})

app.use("/", (req, res) => {
 console.log("i'm being called")
 const writeStream = fs.createWriteStream(`bucket/${req.headers['x-chunk-number']}__${req.headers['x-original-filename']}`);
 req.pipe(writeStream)
 writeStream.on("finish", () => {
  res.json("success")
 })
 writeStream.on("error", (e) => {
  console.log(e)
  res.json("error")
 })
})




app.listen("3002",() => {
    console.log(`server running on 3002`)
})