
import { uploadFileForInfo} from "./sendToFFPROBE.js";
import { generateVideoInformationCard } from "./generatingBlocks.js";

const files = document.getElementById("filesForm");
const submit = document.getElementById("submit");
const locationForm = document.getElementById("locationForm");
const form = document.getElementById("form");
const formBlock = document.getElementById("generated-blocks-container");
const uploadFileButton = document.getElementById("upload-button");
export let videoDetails = { duration:"", size:"", name:"", ext:""}
export let videoInfoCard = document.querySelector(".video-info");
const canvas = document.getElementById("canvas");
let url = ""
let filesCollection = []



files.addEventListener("change", (e) => { handleUpload(e)})

submit.addEventListener("click", (e) => {
    console.log("clicked")
    e.preventDefault()
    upload(uploadPrep)
})

async function upload(cb)
{
    let count = 0 
    while(count <= filesCollection.length - 1)
    {
        cb(filesCollection[count])
        count++
    }

}

async function handleUpload(e)
{
 filesCollection = []
 filesCollection.push(chunkVideo(e.target.files[0]))
 await uploadFileForInfo(filesCollection[0])
 url = URL.createObjectURL(e.target.files[0])
 createScreenShot()
 videoDetails.name = e.target.files[0].name.split(".")[0];
 videoDetails.ext = e.target.files[0].name.split(".")[1];
 videoDetails.size = e.target.files[0].size;
 generateVideoInformationCard(e.target.files[0])
}

async function uploadPrep(chunksObj)
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
        let res = await fetch("http://localhost:3003/upload/finishedupload", {method:"POST", body:JSON.stringify({name: chunksObj.name.split(".")[0], ext: chunksObj.name.split(".")[1],chunks:chunks}), headers: {'Content-Type': 'application/json'}})
        if(res.ok)
        {
            
        }
        else
        {
            throw new Error("failed to upload")
        }
    } catch (error) {
        console.error(error)
    }

    try {
        let res = await fetch("http://localhost:3000/return/setlocation", {method:"POST", body:JSON.stringify({name: chunksObj.name, location: locationForm.value}), headers: {'Content-Type': 'application/json'}})
        if(res.ok)
        {
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
        const promise = fetch("http://localhost:3003/upload/videochunks", {method:"POST", body:obj.chunk, headers: {'Content-Type': obj.chunk.type, 'Content-Length': obj.chunk.size.toString(), 'X-Original-Filename': obj.chunk.name.split(".")[0], 'X-Chunk-Number': obj.id},duplex: 'half'})
        taskPromises.push(promise);
        }

        const results = await Promise.all(taskPromises);
        console.log(results)
        return []
        
    } catch (error) {
        console.log(error)
    }
    
}



function chunkVideo(file)
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
          let chunk = new File([file.slice(start,(chunkEnd))],file.name,{type: file.type})
          mediaChunks.push(chunk)
          start = start + chunkSize
     }
    return {mediaChunks: mediaChunks, type: file.type, name: file.name, numberOfChunks: id, size: file.size}
}





function createScreenShot()
{
    const video = document.createElement("video");
    video.src = url;
    video.load();
    video.muted = true; // avoid autoplay blocking
    video.playsInline = true;

    video.addEventListener("loadedmetadata", () => {
        document.getElementById("video-duration").textContent = formatTime(video.duration);
        videoDetails.duration = video.duration;
        video.currentTime = 12;
    });

    video.addEventListener("seeked", () => {
          const ctx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // draw current frame into canvas
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

          // export as image
          screenshot.src = canvas.toDataURL("image/png");

          // cleanup blob URL if you won’t reuse
          URL.revokeObjectURL(url);})
}






function formatTime(value)
{
    let time = value
    let finished = false

    let hours = 0
    let mins = 0
    let seconds = 0
    while(!finished)
    {
        if(time > 3600)
        {
            console.log(time)
            hours = Math.floor(time / 3600)
            time = time - (hours * 3600)
        }
        else if(time > 60)
        {
            console.log(time)
            mins = Math.floor(time / 60)
            time = time - (mins * 60)
        }
        else
        {
            console.log(time)
            seconds = Math.round(time)
            finished = true
        }
    }

    return `${hours < 10 ? "0"+hours : hours}:${mins < 10 ? "0"+mins : mins}:${seconds < 10 ? "0"+seconds : seconds}`
}




uploadFileButton.addEventListener("click", (e) => {
    e.preventDefault()
    files.click()
})