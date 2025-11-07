import { spawnSync } from 'child_process';
import { EventEmitter } from 'node:events';
import {chunkFileAndSendChunks, removeVideo} from '../utils/createFile.js';
import { SystemLogger, VideoMetaData } from '../src/ffmpeg.js';
import fs from 'fs';
const videoEmitter = new EventEmitter();
const videoList = []
let active = false

videoEmitter.on('add', videoAddTask);
videoEmitter.on('chunk', chunkFileAndSendChunks);

export async  function main(fileName, id)
{
 SystemLogger.write(`Starting ffmpeg process on ${fileName}.`);
 videoEmitter.emit('add', {fileName,id})
}

export function videoAddTask(fileObject)
{
  videoList.push(fileObject)
  SystemLogger.write(`${fileObject.fileName} added to queue.`);
  if(!active)
  {
    SystemLogger.write("Queue system started.");
    active = true
    videoWork()
    active = false
    SystemLogger.write("Queue system finished.");
  }
  return
}




function videoWork()
{
    while(videoList.length >= 1)
    {
        let videoInfo = videoList.shift()
        const {commandArray: command, fileObject:videoInfoObj} = buildCommand(videoInfo.id,videoInfo.fileName)
        console.log("COMMAND: ",command)
        ffmpegAction(videoInfo.fileName, command)
        fs.rmSync(`temp/IN/${videoInfoObj.oldFileName}.${videoInfoObj.ext}`)
        videoEmitter.emit('chunk', `${videoInfoObj.id}-${videoInfoObj.fileName}.${videoInfoObj.ext}`,"OUT",videoInfoObj.id)
    }
    return 
}


function ffmpegAction(file, command)
{
    console.log(file, ' is getting converted')
    const results = spawnSync('ffmpeg',command,{})

    if (results.error) {
        throw new Error(`FFmpeg spawn error: ${results.error.message}`);
    }

    if (results.status !== 0) {
    throw new Error(
      `FFmpeg exited with code ${results.status}: ${results.stderr}`
    );
    }

    console.log(videoList[0], ' completed')
}


function buildCommand(id,file)
{
  let command = `-i temp/IN/${file} -map 0 -map -0:t `; 
  console.log(id)
  let fileObject = VideoMetaData.get(id);
  let removedStreams = fileObject.streamArrayInformation.filter((stream) => (stream.selected === false))
  if(removedStreams.length > 0)
  {
    console.log("Removed streams", removedStreams)
  }
  console.log("after removing streams")
  let fileName = fileObject.fileName !== "" ? fileObject.fileName : fileObject.oldFileName 
  command += `-c copy temp/OUT/${fileObject.id}-${fileName}.${fileObject.ext}`
  const commandArray = command.split(" ");
  fileObject.fileName = fileName;   
  return {commandArray,fileObject}
}


function customCommand()
{
  // plan out how to handle each video type
}