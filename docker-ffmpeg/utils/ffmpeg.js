import { spawnSync } from 'child_process';
import { EventEmitter } from 'node:events';
import fs from "node:fs"
const videoEmitter = new EventEmitter();
const videoList = []
let active = false

videoEmitter.on('add', videoAddTask);
videoEmitter.on('finished', returnVideo)

export async  function main(fileName)
{
 console.log("Main is called")
 videoEmitter.emit('add', fileName)
}

export function videoAddTask(fileName)
{
  console.log("videoAddTask")
  videoList.push(fileName)
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
        console.log("test was called")
        ffmpegAction(videoList[0])
        videoEmitter.emit('finished', `new${videoList[0]}`)
        fs.rmSync(`temp/${videoList[0]}`)
        videoList.shift()
    }
    return 
}


function ffmpegAction(file)
{
    console.log(videoList)
    console.log(videoList[0], ' is getting converted')
    const results = spawnSync('ffmpeg',['-i', `temp/${file}`, '-map', '0:0', '-map', '0:1', '-c', 'copy', `temp/new${file}`],{})

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



async function returnVideo(videoFile)
{
      const readStream = fs.createReadStream(`temp/${videoFile}`);
      const stats = fs.statSync(`temp/${videoFile}`);
      console.log(stats.size, " : file size")
      console.log("Called-----")
      try {
          const a = await fetch("http://localhost:3000/videoreturn", {method:"POST", body:readStream, headers: {
          'Content-Type': 'video/mkv',
          'Content-Length': stats.size.toString(),
          'X-Original-Filename': videoFile
        },duplex: 'half'})
      } catch (error) {
          console.log(error)
      }
}