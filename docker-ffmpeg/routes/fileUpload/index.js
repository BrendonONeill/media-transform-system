import {generationFile, chunkCheck, chunkFileAndSendChunks, removeVideo} from '../../utils/createFile.js'
import fs from "node:fs"
import { main } from '../../utils/ffmpeg.js';
import { getVideoInformation } from '../../utils/ffprobe.js';
import { SystemLogger, VideoMetaData } from '../../src/ffmpeg.js';
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
  let fileInformation = req.body;
  console.log(fileInformation);
  let id = uuidv4().slice(0,7);
  fileInformation.id = id;
  VideoMetaData.set(id,fileInformation);
  console.log("testing part 1: ", fileInformation, id)
  if(await chunkCheck(fileInformation))
  {
    SystemLogger.write(`//////////////////////////////////////////////////////////////`);
    await generationFile(fileInformation, id);
    SystemLogger.write(`File: ${fileInformation.oldFileName}.${fileInformation.ext} was uploaded successfully.`);
    main(`${fileInformation.oldFileName}.${fileInformation.ext}`,id);
    res.json("thank you");
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
    SystemLogger.write(`//////////////////////////////////////////////////////////////`);
    await generationFile(fileInformation)
    SystemLogger.write(`File: ${fileInformation.oldFileName}.${fileInformation.ext} was uploaded successfully.`);
    let videoJson = getVideoInformation(`${fileInformation.oldFileName}.${fileInformation.ext}`)
    SystemLogger.write(`Information on ${fileInformation.oldFileName}.${fileInformation.ext} was collected.`);
    removeVideo(`${fileInformation.oldFileName}.${fileInformation.ext}`,"IN")
    SystemLogger.write(`File: ${fileInformation.oldFileName}.${fileInformation.ext} was removed successfully.`);
    SystemLogger.write(`File: ${fileInformation.oldFileName}.${fileInformation.ext} data returned to client.`);
    SystemLogger.write(`//////////////////////////////////////////////////////////////`);
    res.json(videoJson)
  }
  else
  {
     res.json("error uploading file")
  }
}
