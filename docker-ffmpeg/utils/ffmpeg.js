import { spawnSync } from 'child_process';
import { EventEmitter } from 'node:events';
import fs from "node:fs"
const videoEmitter = new EventEmitter();
const videoList = []
let active = false

videoEmitter.on('add', videoAddTask);

export async  function main(fileName)
{
 console.log("Starting ffmpeg process")
 videoEmitter.emit('add', fileName)
}

export function videoAddTask(fileName)
{
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
        ffmpegAction(videoList[0])
        fs.rmSync(`temp/${videoList[0]}`)
        videoList.shift()
    }
    return 
}


function ffmpegAction(file)
{
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



