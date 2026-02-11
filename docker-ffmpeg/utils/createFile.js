import fs from "node:fs"
import { buffer } from 'stream/consumers';
import { Blob } from 'buffer';
import { VideoMetaData } from "../src/ffmpeg.js";
import mediaFormats from "./mediaFormats.js";

export  async function generationFile(videoInformation,id=null)
{
    // Rewrite this function to make sure chunks go into file
    try {
        //console.log("Creating video from chunks")
        //console.log(videoInformation)
        
        const fileName = `./temp/IN/${id}-${videoInformation.oldFileName}.${videoInformation.ext}`;
        let writeStream = fs.createWriteStream(fileName);

        for(let i = 0; i <= videoInformation.chunks; i++)
        {
            const chunkFile = `./bucket/${i}__${videoInformation.oldFileName}__${videoInformation.id}`;
            if (!fs.existsSync(chunkFile)) {
                console.log(`No more files found. Stopped at ${i}/${videoInformation.chunks}`);
                break;
            }

            await new Promise((resolve, reject) => {
                const readStream = fs.createReadStream(chunkFile);

                readStream.on("error", (err) => {
                    console.log(err);
                    reject();
                })

                readStream.on("data", (chunk) => {
                // Handle backpressure
                if (!writeStream.write(chunk)) {
                readStream.pause();
                writeStream.once("drain", () => readStream.resume());
                }
                });

                readStream.on("end", () => {
                    // console.log(`---------------------`);
                   // console.log(`Streamed: ${chunkFile}`);
                   //console.log(`---------------------`);
                    resolve();
                });
            })
        }

        await new Promise((resolve, reject) => {
                writeStream.end();
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
        });
        removeChunks(videoInformation.chunks,videoInformation.oldFileName, videoInformation.id);
    } catch (error) {
        
    }
}


export async function chunkCheck(fileInfo)
{
    //console.log("Checking chunks...");

    const maxRetries = 3;
    const delayAmounts = [0, 3000, 5000, 15000, 30000];
    const totalChunks = fileInfo.chunks + 1;

    for (let i = 0; i < totalChunks; i++)
    {
        const chunkPath = `./bucket/${i}__${fileInfo.oldFileName}__${fileInfo.id}`;
        let retryCount = 0;

        while (retryCount < maxRetries)
        {
            if(fs.existsSync(chunkPath))
            {
                const stats = fs.statSync(chunkPath);
                console.log("[Chunk name]", `${i}__${fileInfo.oldFileName}`)
                console.log("[Chunk Size]", `${stats.size}`);
                console.log("[test]", `${fileInfo.chunkSizes[i]}`);
                if(stats.size == fileInfo.chunkSizes[i])
                {
                     console.log(`✓ Chunk ${i}/${fileInfo.chunks}: ${stats.size} bytes`);
                     break;
                }
            }

            retryCount++;

            if (retryCount < maxRetries) {
                const delay = delayAmounts[retryCount];
            console.log( `✗ Chunk ${i} missing. Retry ${retryCount}/${maxRetries} ` + `in ${delay}ms...`);
            await wait(delay);
            } else {
                console.error(`✗ Chunk ${i} failed after ${maxRetries} retries`);
                return false;
            }
        }

    }

    //console.log(`✓ All ${totalChunks} chunks verified`);
    return true;
}

export async function fileCheck(filename)
{
    //console.log("checking chunks")
    let delayAmount = [0,30000,60000]
    let delayCount = 0
    let i = 0
    while(i < 1)
    {
        if(delayCount > 0)
        {
            await wait(delayAmount[delayCount]);
        }
        if(delayCount > 2)
        {
            return false
        }
        let check = fs.existsSync(`./temp/IN/${filename}`)
        if(check)
        {
            i++
        }
        else
        {
            delayCount++
        }
    }
    return true
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export function removeVideo(name,dir)
{
            const filename = `./temp/${dir}/${name}`;
            if (!fs.existsSync(filename)) {
                
                //console.log(`No more files found at ./temp/${dir}/${name}`);
            }
            else
            {
                fs.rmSync(filename)
            }
            
}

function removeChunks(chunks,name, id)
{
    let i = 0
    while (i <= chunks) {
            const filename = `./bucket/${i}__${name}__${id}`;

            if (!fs.existsSync(filename)) {
                
                //console.log(`No more files found. Stopped at ${i}`);
                break;
            }
            fs.rmSync(filename)
            i++;
        }
}


export async function chunkFileAndSendChunks(fileName,dir,vo)
{
    const readStream = fs.createReadStream(`temp/${dir}/${fileName}`);
    const fileBuffer = await buffer(readStream);
    //Automate type
    let ext = vo.newExt !== ""  ? vo.newExt : vo.ext;
    let type = blobType(ext);
    console.log(type)
    const blob = new Blob([fileBuffer],{type});
    let chunkObj = chunkVideo(blob, fileName)
    removeVideo(fileName,"OUT");
    sendBackPrep(chunkObj,vo.id);
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


async function sendBackPrep(chunksObj,id)
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
        const {fileName,ext,location,newExt,encoded} = VideoMetaData.get(id);
        let returnedExt = encoded == true ? newExt : ext;
        let chunkSizes = storeChunkValues(chunksObj.mediaChunks) 
        let res = await fetch("http://localhost:3000/return/finishedUpload", {method:"POST", body:JSON.stringify({name: fileName, ext: returnedExt, chunks,location,id, chunkSizes}), headers: {'Content-Type': 'application/json'}})
        if(res.ok)
        {
            console.log("Sent back to main server");
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


function storeChunkValues(chunks)
{
    let chunkSizes = []
    for(let i = 0; i < chunks.length; i++)
    {
        chunkSizes.push(chunks[i].size)
    }
    return chunkSizes
}


export function generationFileNames(obj)
{
    obj.inputFile = `${obj.id}-${obj.oldFileName}.${obj.ext}`
    let fileName = obj.fileName !== "" ? obj.fileName : obj.oldFileName
    if(obj.newExt)
    {
        obj.outputFile = `${obj.id}-${fileName}.${obj.newExt}`
    }
    else
    {
        obj.outputFile = `${obj.id}-${fileName}.${obj.ext}`
    }
}


function blobType(ext)
{
    let value = mediaFormats[ext].meta;
    return value;
}