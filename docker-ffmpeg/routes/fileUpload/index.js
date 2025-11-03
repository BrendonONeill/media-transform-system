import {generationFile, chunkCheck, chunkFileAndSendChunks, removeVideo} from '../../utils/createFile.js'
import fs from "node:fs"
import { main } from '../../utils/ffmpeg.js';
import { getVideoInformation } from '../../utils/ffprobe.js';
import { VideoMetaData } from '../../src/ffmpeg.js';
import { v4 as uuidv4 } from 'uuid';

export async function receivingChunks(req, res)
{
 //console.log("New Chunk received from: ", req.headers['x-original-filename'] );
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
  console.log(fileInformation)
  let id = uuidv4();
  VideoMetaData.set(id,fileInformation.commandInfo);
  if(await chunkCheck(fileInformation))
  {
    // clean up how this works
    await generationFile(fileInformation)
    await main(`${fileInformation.name}.${fileInformation.ext}`,id);
    await chunkFileAndSendChunks(`${fileInformation.name}.${fileInformation.ext}`)
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
    await generationFile(fileInformation)
    let videoJson = getVideoInformation(`${fileInformation.name}.${fileInformation.ext}`)
    //console.log(typeof videoJson)
    removeVideo(`${fileInformation.name}.${fileInformation.ext}`)
    res.json(videoJson)
  }
  else
  {
     res.json("error uploading file")
  }
 
  
}
