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

export async  function main(fileObject)
{
 SystemLogger.write(`Starting ffmpeg process on ${fileObject.oldFileName}.`);
 videoEmitter.emit('add', fileObject)
}

export function videoAddTask(fileObject)
{
  videoList.push(`${fileObject.oldFileName}.${fileObject.ext}`)
  SystemLogger.write(`${fileObject.fileName} added to queue.`);
  if(!active)
  {
    SystemLogger.write("Queue system started.");
    active = true
    videoWork(fileObject.id)
    active = false
    SystemLogger.write("Queue system finished.");
  }
  return
}




function videoWork(id)
{
    while(videoList.length >= 1)
    {
        let videoInfo = videoList.shift()
        
        const command = buildCommand(id)
        console.log("COMMAND: ",command)
        let videoInfoObj = VideoMetaData.get(id)
        ffmpegAction(command, id)
        console.log("[videoinfo]", videoInfo)
        fs.rmSync(`temp/IN/${videoInfoObj.inputFile}`);
        videoEmitter.emit('chunk', `${videoInfoObj.outputFile}`,"OUT",videoInfoObj)
    }
    return 
}


function ffmpegAction(command,id)
{
    let videoInfoObj = VideoMetaData.get(id)
    console.log(command)
    if(videoInfoObj.attachments)
    {
      const copyResults = spawnSync('ffmpeg',['-i', `temp/IN/${videoInfoObj.inputFile}`,'-map','0:v?','-map','0:a?','-map','0:s?', '-c', 'copy', `temp/IN/${videoInfoObj.id}-att.mkv` ],{})
      
      if (copyResults.error) {
        throw new Error(`FFmpeg spawn error: ${copyResults.error.message}`);
      }

      if (copyResults.status !== 0) {
        throw new Error(`FFmpeg exited with code ${copyResults.status}: ${copyResults.stderr}`);
      }

      command[1] = `temp/IN/${videoInfoObj.id}-att.mkv`
    }

    const results = spawnSync('ffmpeg',command,{
      maxBuffer: 1024 * 1024 * 10,
    })

    if (results.error) {
        throw new Error(`FFmpeg spawn error: ${results.error.message}`);
    }

    if (results.status !== 0) {
    throw new Error(
      `FFmpeg exited with code ${results.status}: ${results.stderr} `
    );
    }

    console.log(videoInfoObj.file, ' completed')
}


function buildCommand(id)
{
  let command = []; 
  let commandArr = [];
  let fileObject = VideoMetaData.get(id);
  commandArr.push(`-i`);
  commandArr.push(`placeholder`);
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