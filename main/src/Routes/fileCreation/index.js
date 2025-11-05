import {generationFile} from '../../../utils/createFile.js'
import fs from "node:fs"
import { chunkCheck } from '../../../utils/createFile.js';

export async function receivingChunks(req, res){
   console.log("Returned Chunk received from: ", req.headers['x-original-filename'] );
   const writeStream = fs.createWriteStream(`bucket/${req.headers['x-chunk-number']}__${req.headers['x-original-filename']}`);
   req.pipe(writeStream)
   writeStream.on("finish", () => {
    res.json("success")
   })
   writeStream.on("error", (e) => {
    console.log(e)
    res.json("error")
   })
}

export async function finishedUpload(req, res){
  let fileInformation = req.body
  if(await chunkCheck(fileInformation))
  {
    await generationFile(fileInformation);
    res.json("thank you")
  }
  else
  {
    res.json("error uploading file")
  }
}


export async function setLocation(req, res)
{
  console.log("setting location")
  let location = req.body.location
  let file = req.body.name
  res.json('success')
}