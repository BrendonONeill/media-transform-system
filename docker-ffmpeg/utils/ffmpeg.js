import { spawnSync } from 'child_process';
import { spawn } from 'node:child_process';

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

export async function main(fileObject)
{
 SystemLogger.addToQueue(`Starting ffmpeg process on ${fileObject.oldFileName}.`);
 videoEmitter.emit('add', fileObject)
}

export async function videoAddTask(fileObject)
{
  videoList.push(`${fileObject.oldFileName}.${fileObject.ext}`)
  SystemLogger.addToQueue(`${fileObject.fileName} added to queue.`);
  if(!active)
  {
    SystemLogger.addToQueue("Queue system started.");
    active = true
    await videoWork(fileObject.id)
    active = false
    SystemLogger.addToQueue("Queue system finished.");
  }
  return
}




async function videoWork(id)
{
    while(videoList.length >= 1)
    {
        let videoInfo = videoList.shift()
        
        let command = buildCommand(id)
        command = command.filter((cmd) => cmd !== '');
        //console.log('[command]: ', command)
        let videoInfoObj = VideoMetaData.get(id)
        await ffmpegAction(command, id)
        //console.log("[videoinfo]", videoInfo)
        fs.rmSync(`temp/IN/${videoInfoObj.inputFile}`);
        videoEmitter.emit('chunk', `${videoInfoObj.outputFile}`,"OUT",videoInfoObj)
    }
    return 
}


async function ffmpegAction(command,id)
{
    let videoInfoObj = VideoMetaData.get(id)
    //console.log(command)
    if(videoInfoObj.attachments)
    {
      const copyResults = await handleFfmpeg('ffmpeg',['-i', `temp/IN/${videoInfoObj.inputFile}`,'-map','0:v?','-map','0:a?','-map','0:s?', '-c', 'copy', `temp/IN/${videoInfoObj.id}-att.mkv` ],{})
      command[1] = `temp/IN/${videoInfoObj.id}-att.mkv`
    }

    const results = await handleFfmpeg('ffmpeg',command,{
      maxBuffer: 1024 * 1024 * 10,
    })
    //console.log(videoInfoObj.file, ' completed')
}

function handleFfmpeg(cmd,args = [], options= {})
{
  return new Promise((resolve, reject) => {
    const child = spawn(cmd,args,options);

    child.stdout.on("data", (data) => console.log(data.toString()));

    child.on("error", reject);

    child.on("close", (code) => {
      if(code === 0) {
        resolve(code);
      }
      else
      {
        reject(new Error(`Process exited with code ${code}`));
      }
    })
  })
}


function buildCommand(id)
{
  let command = []; 
  let commandArr = [];
  let fileObject = VideoMetaData.get(id);
  commandArr.push(`-i`);
  commandArr.push(`placeholder`);
  commandArr.push(...[`-progress`, `pipe:1`, `-nostats`]);
  console.log(fileObject);
  if(fileObject.ext == "mkv")
  {
    handleAttachments(fileObject);
  }
  
  let streamsStrings = handledStreams(fileObject.streamArrayInformation,fileObject.encoded);
  commandArr.push(...streamsStrings);

  let fileName = fileObject.fileName !== "" ? fileObject.fileName : fileObject.oldFileName ;
  let fileInput = `temp/IN/${fileObject.inputFile}`;
  let commandEnd = `temp/OUT/${fileObject.outputFile}`;
 
  if(fileObject.encoded)
  {
    let ext = fileObject.newExt !== '' ? fileObject.newExt : fileObject.ext
    let encoder = mediaFormats[ext]
    commandArr.push(handleEncoded(encoder,fileObject))
  }
  else
  {
    handleCopy()
  }

  command = commandArr.join(" ").split(" ");
  command[1] = fileInput;
  command.push(commandEnd);
  fileObject.fileName = fileName;
  VideoMetaData.set(id,fileObject);
  return command
}


function handleAttachments(fileObject)
{
  console.log(fileObject);
  let attachmentStreams = fileObject.streamArrayInformation.some((obj) => obj.type === 'attachment');
  if(!attachmentStreams)
  {
    return
  }
  fileObject.attachments = true;
}


function handleEncoded(encoder, videoObj)
{
  let videoStream = videoObj.streamArrayInformation.some((obj) => obj.type === 'video');
  let audioStream = videoObj.streamArrayInformation.some((obj) => obj.type === 'audio');
  let subtitleStream = videoObj.streamArrayInformation.some((obj) => obj.type === 'subtitle');
  let string = ''
  if(videoStream)
  {
    string += `-c:v ${encoder.video} `
  }
  if(audioStream)
  {
    string += `-c:a ${encoder.audio} `
  }if(subtitleStream)
  {
    string += `-c:s ${encoder.subtitles}`
  }
  return string;
}


function handleCopy()
{
  return `-c copy`
}

function handleCustomCommand(commandObj,removedStreams,editedStream)
{
  let commandArr = [];

  if(removedStreams)
  {
      commandArr.push(commandObj.string)
  }
  
  if(editedStream)
  {
    if(commandObj.type == "video")
    {
      if(commandObj.editedValues.includes("fps"))
      {
        commandArr.push(`-r ${commandObj.fps}`)
      }

      if(commandObj.editedValues.includes("scale"))
      {
        commandArr.push(`-vf "scale=${commandObj.width}:${commandObj.height}"`)
      }
    }
  }
  if(commandArr.length > 0)
  {
    let commandString = ""
    for (let i = 0; i < commandArr.length; i++) {
      commandString = commandString + " " + commandArr[i];
    }
    return commandString.trim()
  }
  else
  {
    return null
  }
}

function handledStreams(arrayOfCommands,encoded)
{
  let commandArr = []
  let active = true;
  let removedStreams = arrayOfCommands.some(obj => obj.selected === false);
  for (let i = 0; i < arrayOfCommands.length; i++) {
    
    if(arrayOfCommands[i].selected === true && arrayOfCommands[i].type !== 'attachment')
    {
      if(encoded)
      {
        let remove = removedStreams;
        let edit = arrayOfCommands[i].edited;
        if(remove)
        {
          active = false;
        }
        let result = handleCustomCommand(arrayOfCommands[i],remove,edit)
        if(result !== null)
        {
          commandArr.push(result)
        }
      }
    }
    else
    {
      continue
    }
  }

  if(active)
  {
    commandArr.push('-map 0:v? -map 0:a? -map 0:s?')
  }
  
  return commandArr
}