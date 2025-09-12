import fs from "node:fs"
import { main } from '../utils/ffmpeg.js'
import { buffer } from 'stream/consumers';
import { Blob } from 'buffer';

export  async function generationFile(videoInformation)
{
    try {
        console.log("Creating video from chunks")
        const writeStream = fs.createWriteStream(`./temp/${videoInformation.name}.${videoInformation.ext}`);
        let i = 0;
         while (i <= videoInformation.chunks) {
            const filename = `./bucket/${i}__${videoInformation.name}`;
            // Check if file exists
            if (!fs.existsSync(filename)) {
                
                console.log(`No more files found. Stopped at ${i}`);
                break;
            }
            const readStream = fs.createReadStream(filename);
            
            await new Promise((resolve, reject) => {
                readStream.on('data', chunk => {
                    let end = chunk.length
                    writeStream.write(chunk.subarray(0, chunk.length));
                });
                
                readStream.on('end', () => {
                    console.log(`Streamed: ${filename}`);
                    resolve();
                });
                
                readStream.on('error', (err) => {
                    console.log(err)
                    reject
                });
            });
            
            i++;
        }
        console.log("hello........")
        removeChunks(videoInformation.chunks,videoInformation.name)
        main(`${videoInformation.name}.${videoInformation.ext}`)
        chunkFileAndSendChunks(`${videoInformation.name}.${videoInformation.ext}`)
        removeVideo(`${videoInformation.name}.${videoInformation.ext}`)

    } catch (error) {
        
    }
}


function removeVideo(name)
{
            const filename = `./temp/${name}`;
            if (!fs.existsSync(filename)) {
                
                console.log(`No more files found. Stopped at ${i}`);
            }
            fs.rmSync(filename)
}

function removeChunks(chunks,name)
{
    let i = 0
    while (i <= chunks) {
            const filename = `./bucket/${i}__${name}`;

            if (!fs.existsSync(filename)) {
                
                console.log(`No more files found. Stopped at ${i}`);
                break;
            }
            fs.rmSync(filename)
            i++;
        }
}


async function chunkFileAndSendChunks(fileName)
{
    const readStream = fs.createReadStream(`temp/new${fileName}`);
    const fileBuffer = await buffer(readStream);
    const blob = new Blob([fileBuffer],{type: "video/x-matroska"});
    let chunkObj = chunkVideo(blob, fileName)
    sendBackPrep(chunkObj)
}


function chunkVideo(file,filename)
{
    let mediaChunks = []
    let start = 0
    let chunkSize = (1024 * 1024) * 80
    let end = file.size
    let id = 0
    while(start < end)
     {
          id += 1
          let chunkEnd = start + chunkSize
          if(chunkEnd > end)
          {
              chunkEnd = end
          }
          let chunk = new File([file.slice(start,(chunkEnd))],filename,{type: file.type})
          mediaChunks.push(chunk)
          start = start + chunkSize
     }
    return {mediaChunks: mediaChunks, type: file.type, name: filename, numberOfChunks: id, size: file.size}
}


async function sendBackPrep(chunksObj)
{ 
    let chunks = chunksObj.numberOfChunks - 1
    let chunksObjArr = chunksObj.mediaChunks
    let count = 0
    let arrChunks = []
    while(count <= chunks)
    {
        if(arrChunks.length < 3)
        {
            arrChunks.push({chunk:chunksObjArr[count],id:count})
            count++
        }
        else
        {
            arrChunks = await uploadFetch(arrChunks) 
        }
        
    }
    if(arrChunks.length > 0)
    {
        arrChunks = uploadFetch(arrChunks)
    }
    try {
        let res = await fetch("http://localhost:3000/return/finishedUpload", {method:"POST", body:JSON.stringify({name: chunksObj.name.split(".")[0], ext: chunksObj.name.split(".")[1],chunks:chunks}), headers: {'Content-Type': 'application/json'}})
        if(res.ok)
        {
            console.log("Happy")
            return
        }
        else
        {
            throw new Error("failed to upload")
        }
    } catch (error) {
        console.error(error)
    }
}

async function uploadFetch(arrChunks)
{
    try {
        let taskPromises = []
        
        for (const obj of arrChunks) {
        const promise = await fetch("http://localhost:3000/return/videochunks", {method:"POST", body:obj.chunk, headers: {'Content-Type': obj.chunk.type, 'Content-Length': obj.chunk.size.toString(), 'X-Original-Filename': obj.chunk.name.split(".")[0], 'X-Chunk-Number': obj.id},duplex: 'half'})
        taskPromises.push(promise);
        }

        const results = await Promise.all(taskPromises);
        return []
        
    } catch (error) {
        console.log(error)
    }
    
}