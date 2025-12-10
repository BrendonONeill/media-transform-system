import { spawnSync } from 'child_process';
import { EventEmitter } from 'node:events';
import {chunkFileAndSendChunks, removeVideo} from '../utils/createFile.js';
import { SystemLogger, VideoMetaData } from '../src/ffmpeg.js';
import fs from 'fs';
import mediaFormats from './mediaFormats.js';
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
        ffmpegAction(videoInfo.fileName, command, videoInfoObj.ext, videoInfo.id)
        fs.rmSync(`temp/IN/${videoInfo.id}-${videoInfoObj.oldFileName}.${videoInfoObj.ext}`)
        videoEmitter.emit('chunk', `${videoInfoObj.id}-${videoInfoObj.fileName}.${videoInfoObj.ext}`,"OUT",videoInfoObj.id)
    }
    return 
}


function ffmpegAction(file, command, ext, id=0)
{
    console.log(file, ' is getting converted')
    if(ext === "mkv")
    {
      const results = spawnSync('ffmpeg',['-i', `temp/IN/${id}-${file}`, '-map', '0', '-map', '-0:t', '-c', 'copy', `temp/IN/${id}-${file}`],{})

    if (results.error) {
        throw new Error(`FFmpeg spawn error: ${results.error.message}`);
    }

    if (results.status !== 0) {
    throw new Error(
      `FFmpeg exited with code ${results.status}: ${results.stderr}`
    );
    }
    }
    
    const results = spawnSync('ffmpeg',command,{})

    if (results.error) {
        throw new Error(`FFmpeg spawn error: ${results.error.message}`);
    }

    if (results.status !== 0) {
    throw new Error(
      `FFmpeg exited with code ${results.status}: ${results.stderr} `
    );
    }

    console.log(videoList[0], ' completed')
}


function buildCommand(id,file)
{
  // Look for space created in command
  let command = `-i placeholder`; 
  console.log(id)
  let fileObject = VideoMetaData.get(id);
  let streamCommand = handledStreams(fileObject.streamArrayInformation)
  command += streamCommand
  let fileName = fileObject.fileName !== "" ? fileObject.fileName : fileObject.oldFileName 
  let commandEnd = `temp/OUT/${fileObject.id}-${fileName}.${fileObject.ext}`
  let commandArray = command.split(" ");
  commandArray[1] = `temp/IN/${id}-${file}`
  commandArray.push(commandEnd);
  commandArray = commandArray.filter(c => c != "")
  fileObject.fileName = fileName;   
  return {commandArray,fileObject}
}

function handledStreams(arrayOfCommands)
{
  let removedStreams = arrayOfCommands.some(obj => obj.type === 'attachment' || obj.selected === false);
  let encodedStreams = arrayOfCommands.filter(obj => obj.edited === true);
  let command = ""
  for(let i = 0; i < arrayOfCommands.length; i++)
  {
    if(arrayOfCommands[i].selected === false || arrayOfCommands[i].type === 'attachment')
    {
      continue
    }
    else
    {
      if(arrayOfCommands[i].edited)
      {
        let customC = customCommand(arrayOfCommands[i], removedStreams)
        command = command + " " + customC
      }
      else
      {

        let streamCommand = removedStreams === true ? arrayOfCommands[i].string : "";
        command = command + " " + streamCommand
      }
    }
    
  }
  console.log(command)
  if(encodedStreams.length == 0)
  {
    command = command + " -c copy"
  }
  return command
}

function customCommand(commandObj, rmS)
{
  if(commandObj.type == "video")
  {
    let a = mediaFormats[commandObj.ext]
    let s = rmS === true ? commandObj.string : "";
    console.log("testing: ",a,s);
    return ` ${s} -c:v ${a.video}`
  }
}