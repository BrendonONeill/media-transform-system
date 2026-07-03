import {generationFile, chunkCheck, chunkFileAndSendChunks, removeVideo, fileCheck, generationFileNames} from '../../utils/createFile.js'
import fs from "node:fs"
import { main } from '../../utils/ffmpeg.js';
import { getVideoInformation } from '../../utils/ffprobe.js';
import { SystemLogger, VideoMetaData } from '../../src/ffmpeg.js';
import { v4 as uuidv4 } from 'uuid';

//cron job to check logger queue

export async function receivingChunks(req, res)
{
 console.log("New Chunk received from: ", req.headers['x-original-filename'], req.headers['x-id-number']);
 const writeStream = fs.createWriteStream(`bucket/${req.headers['x-chunk-number']}__${req.headers['x-original-filename']}__${req.headers['x-id-number']}`);
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
  generationFileNames(fileInformation)
  VideoMetaData.set(fileInformation.id,fileInformation);
  let chunkCheckResults = await chunkCheck(fileInformation);
  SystemLogger.addToQueue(`All chunks arrived at server`);
  if(chunkCheckResults)
  {
    await generationFile(fileInformation, fileInformation.id);
    let fileCheckResults = await fileCheck(fileInformation.inputFile)
    if(fileCheckResults)
    {
      SystemLogger.addToQueue(`File: ${fileInformation.oldFileName}.${fileInformation.ext} was uploaded successfully.`);
      main(fileInformation);
      res.json("File was uploaded successfully");
    }
    else
    {
      // set up clean up function
      res.json("error uploading file")
    }
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
    SystemLogger.actionSpacer();
    await generationFile(fileInformation,fileInformation.id)
    SystemLogger.addToQueue(`File: ${fileInformation.oldFileName}.${fileInformation.ext} was uploaded successfully.`);
    let videoJson = getVideoInformation(`${fileInformation.id}-${fileInformation.oldFileName}.${fileInformation.ext}`)
    SystemLogger.addToQueue(`Information on ${fileInformation.oldFileName}.${fileInformation.ext} was collected.`);
    removeVideo(`${fileInformation.id}-${fileInformation.oldFileName}.${fileInformation.ext}`,"IN")
    SystemLogger.addToQueue(`File: ${fileInformation.oldFileName}.${fileInformation.ext} was removed successfully.`);
    SystemLogger.addToQueue(`File: ${fileInformation.oldFileName}.${fileInformation.ext} data returned to client.`);
    SystemLogger.actionSpacer();
    res.json(videoJson)
  }
  else
  {
     res.json("error uploading file")
  }
}

export async function genID(req,res)
{
  let id = uuidv4().slice(0,7);
  console.log(id);
  res.status(200).json({id});
}
