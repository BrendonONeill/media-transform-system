import {generationFile, chunkCheck, chunkFileAndSendChunks, removeVideo} from '../../utils/createFile.js'
import fs from "node:fs"
import { main } from '../../utils/ffmpeg.js';

export async function receivingChunks(req, res)
{
 console.log("New Chunk received from: ", req.headers['x-original-filename'] );
 const writeStream = fs.createWriteStream(`bucket/${req.headers['x-chunk-number']}__${req.headers['x-original-filename']}`);
 req.pipe(writeStream);
 writeStream.on("finish", () => {
  res.json("success");
 })
 writeStream.on("error", (e) => {
  console.log(e);
  res.json("error");
 })
}

export async function finishedUpload(req, res){
  let fileInformation = req.body
  if(await chunkCheck(fileInformation))
  {
    generationFile(fileInformation)
    main(`${fileInformation.name}.${fileInformation.ext}`)
    chunkFileAndSendChunks(`${fileInformation.name}.${fileInformation.ext}`)
    removeVideo(`${fileInformation.name}.${fileInformation.ext}`)
    res.json("thank you")
  }
  else
  {
     res.json("error uploading file")
  }
}

export async function finishedUploadffprob(req, res){
  let fileInformation = req.body
  if(await chunkCheck(fileInformation))
  {
    generationFile(fileInformation)
    res.json("thank you")
  }
  else
  {
     res.json("error uploading file")
  }
 
  
}
