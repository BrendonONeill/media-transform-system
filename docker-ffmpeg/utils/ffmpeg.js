import { spawnSync } from 'child_process';
import { EventEmitter } from 'node:events';
import {chunkFileAndSendChunks, removeVideo} from '../utils/createFile.js';
import { VideoMetaData } from '../src/ffmpeg.js';
import fs from 'fs';
const videoEmitter = new EventEmitter();
const videoList = []
let active = false

videoEmitter.on('add', videoAddTask);
videoEmitter.on('chunk', chunkFileAndSendChunks);

export async  function main(fileName, id)
{
 console.log("Starting ffmpeg process")
 videoEmitter.emit('add', {fileName,id})
}

export function videoAddTask(fileObject)
{
  videoList.push(fileObject)
  if(!active)
  {
    active = true
    videoWork()
    active = false
  }
  return
}




function videoWork()
{
    while(videoList.length >= 1)
    {
        let videoInfo = videoList.shift()
        const {commandArray: command, fileObject:videoInfoObj} = buildCommand(videoInfo.id,videoInfo.fileName)
        ffmpegAction(videoInfo.fileName, command)
        fs.rmSync(`temp/IN/${videoInfoObj.oldFileName}.${videoInfoObj.ext}`)
        videoEmitter.emit('chunk', `${videoInfoObj.id}-${videoInfoObj.fileName}.${videoInfoObj.ext}`,"OUT")
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
  let command = `-i temp/IN/${file} `; 
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