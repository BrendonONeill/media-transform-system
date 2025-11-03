
import { uploadFileForInfo} from "./sendToFFPROBE.js";
import { generateVideoInformationCard, streamBlocksReset } from "./generatingBlocks.js";
import { upload, uploadPrep } from "./sendToFFMPEG.js";
import "./command.js";

export const videoDetails = { duration:"", size:"", name:"", ext:""}
export const videoInfoCard = document.querySelector(".video-info");
const files = document.getElementById("filesForm");
const submit = document.getElementById("submit");
const uploadFileButton = document.getElementById("upload-button");
const canvas = document.getElementById("canvas");
let url = ""
let filesCollection = []

// Handles getting video information

files.addEventListener("change", (e) => { handleUpload(e)})

uploadFileButton.addEventListener("click", (e) => {
    e.preventDefault()
    files.click()
})

async function handleUpload(e)
{
 filesCollection = []
 filesCollection.push(chunkVideo(e.target.files[0]))
 streamBlocksReset()
 await uploadFileForInfo(filesCollection[0])
 url = URL.createObjectURL(e.target.files[0])
 createScreenShot()
 videoDetails.name = e.target.files[0].name.split(".")[0];
 videoDetails.ext = e.target.files[0].name.split(".")[1];
 videoDetails.size = e.target.files[0].size;
 generateVideoInformationCard(e.target.files[0])
}

// Handles getting video Upload
submit.addEventListener("click", (e) => {
    console.log("clicked")
    e.preventDefault()
    upload(filesCollection,uploadPrep)
})


// Chunking video for uploading
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

// Create image from video uploaded
function createScreenShot()
{
    const video = document.createElement("video");
    video.src = url;
    video.load();
    video.muted = true;
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
          ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          screenshot.src = canvas.toDataURL("image/png");
          URL.revokeObjectURL(url);})
}

// Handling video time format 
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




