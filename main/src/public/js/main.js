const files = document.getElementById("filesForm");
const submit = document.getElementById("submit");
const locationForm = document.getElementById("locationForm");
const form = document.getElementById("form");
const formBlock = document.getElementById("generated-blocks-container");
const uploadFileButton = document.getElementById("upload-button");

let videoDetails = { duration:"", size:"", name:"", ext:""}
let videoInfo = ""
let videoInfoCard = document.querySelector(".video-info");
const canvas = document.getElementById("canvas");
let url = ""
let filesCollection = []

const loadingBG = document.getElementById("loading-bg");
const loadingText = document.getElementById("loading-text");

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
        const promise = await fetch("http://localhost:3003/upload/videochunks", {method:"POST", body:obj.chunk, headers: {'Content-Type': obj.chunk.type, 'Content-Length': obj.chunk.size.toString(), 'X-Original-Filename': obj.chunk.name.split(".")[0], 'X-Chunk-Number': obj.id},duplex: 'half'})
        taskPromises.push(promise);
        }

        const results = await Promise.all(taskPromises);
        console.log(results)
        return []
        
    } catch (error) {
        console.log(error)
    }
    
}

async function uploadFileForInfo(chunks)
{
    try {
        loading("Getting video information...")
        for([index, obj] of chunks.mediaChunks.entries())
        {
            let res =  await fetch("http://localhost:3003/upload/videochunks", {method:"POST", body:obj, headers: {'Content-Type': obj.type, 'Content-Length': obj.size.toString(), 'X-Original-Filename': obj.name.split(".")[0], 'X-Chunk-Number': index},duplex: 'half'})
            console.log(res)
        }
        let res = await fetch("http://localhost:3003/upload/finisheduploadffprob", {method:"POST", body:JSON.stringify({name: chunks.name.split(".")[0], ext: chunks.name.split(".")[1],chunks:chunks.mediaChunks.length - 1}), headers: {'Content-Type': 'application/json'}})
        if(res.ok)
        {
            let data = await res.json()
            generateFormParts(data.streams[0])
            console.log(data);
            videoInfo = data;
            loading()
        }
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


function generateFormParts(stream)
{
    generateVideoInput(stream)
}

function generateVideoInput(videoStream)
{
     const outerDiv = document.createElement("div");
     outerDiv.classList.add("outer-div")
     const nameDiv = document.createElement("div");
     nameDiv.innerHTML = `<h3>Stream 1: Video</h3>`;
     nameDiv.classList.add("gen-div-name");
     const videoDiv = document.createElement("div");
     videoDiv.classList.add("gen-div")
     const div1 = document.createElement("div"); 
     const div2 = document.createElement("div"); 
     const div3 = document.createElement("div");
     div1.classList.add("gen-div-content"); 
     div2.classList.add("gen-div-content"); 
     div3.classList.add("gen-div-content");  
     const extensionType = document.createElement("p");
     const checkboxExtensionLabel = document.createElement("label")
     const checkboxExtension = document.createElement("input")

     const extensionDiv = document.createElement("div");
     const extensionSelectLabel = document.createElement("label");
     const extensionSelect = document.createElement("select");
     console.log(filesCollection)
     extensionType.textContent = `Extension: ${filesCollection[0].type.split("/")[1]}`;
     
     checkboxExtension.type = 'checkbox';
     checkboxExtension.checked = true;
     checkboxExtension.id = 'checkboxExtension';
     checkboxExtensionLabel.append("keep Extension the same",checkboxExtension);

      extensionSelect.innerHTML = 
     `
        <option value="mp4" selected>MP4</option>
        <option value="mkv">MKV</option>
        <option value="mov">MOV</option>
     `
     extensionSelect.disabled = true
     extensionDiv.classList.add("disabled")
     extensionSelectLabel.append("Extension: ",extensionSelect);
     extensionDiv.append(extensionSelectLabel);

     checkboxExtension.addEventListener("click", () => {
        if(checkboxExtension.checked)
        {
            extensionSelect.disabled = true
            extensionDiv.classList.add("disabled")
        }
        else
        {
            extensionSelect.disabled = false
            extensionDiv.classList.remove("disabled")
        }
     })

     const FPSType = document.createElement("p");
     const checkboxFPSLabel = document.createElement("label")
     const checkboxFPS = document.createElement("input")

     const FPSDiv = document.createElement("div");
     const FPSSelectLabel = document.createElement("label");
     const FPSSelect = document.createElement("input");
     FPSSelect.disabled = true

     fpsScore = (Number(videoStream.r_frame_rate.split("/")[0]) / Number(videoStream.r_frame_rate.split("/")[1])).toFixed(2)
     FPSType.textContent = `FPS: ${fpsScore}`;

     checkboxFPS.type = 'checkbox';
     checkboxFPS.checked = true;
     checkboxFPS.id = 'checkboxFPS';
     checkboxFPSLabel.append("keep FPS the same",checkboxFPS);

     FPSSelect.type = "number";
     FPSSelect.value = fpsScore;
     FPSDiv.classList.add("disabled")
     FPSSelectLabel.append("FPS: ", FPSSelect);
     FPSDiv.append(FPSSelectLabel);

     checkboxFPS.addEventListener("click", () => {
        if(checkboxFPS.checked)
        {
            FPSSelect.disabled = true
            FPSDiv.classList.add("disabled")
        }
        else
        {
            FPSSelect.disabled = false
            FPSDiv.classList.remove("disabled")
        }
     })

     const HxWType = document.createElement("p");
     const checkboxHxWLabel = document.createElement("label")
     const checkboxHxW = document.createElement("input")

     const HxWDiv = document.createElement("div");
     const HSelectLabel = document.createElement("label");
     const WSelectLabel = document.createElement("label");
     const HSelect = document.createElement("input");
     const WSelect = document.createElement("input");

     HxWType.textContent = `Dimensions: ${videoStream.coded_height}x${videoStream.coded_width}`;

     checkboxHxW.type = 'checkbox';
     checkboxHxW.checked = true;
     checkboxHxW.id = 'checkboxHxW';
     checkboxHxWLabel.append("Keep Height and Width the same ",checkboxHxW);

     HSelect.type = "number";
     WSelect.type = "number";
     HSelect.value = videoStream.coded_height;
     WSelect.value = videoStream.coded_width;

     HSelect.disabled = true
     WSelect.disabled = true

     HSelectLabel.append("Height: ", HSelect);
     WSelectLabel.append("Width: ", WSelect);
     HxWDiv.classList.add("disabled")
     HxWDiv.append(HSelectLabel,WSelectLabel);

     checkboxHxW.addEventListener("click", () => {
        if(checkboxHxW.checked)
        {
            HSelect.disabled = true
            WSelect.disabled = true
            HxWDiv.classList.add("disabled")
        }
        else
        {
            HSelect.disabled = false
            WSelect.disabled = false
            HxWDiv.classList.remove("disabled")
        }
     })
     div1.append(extensionType, checkboxExtensionLabel, extensionDiv)
     div2.append(FPSType, checkboxFPSLabel, FPSDiv)
     div3.append(HxWType, checkboxHxWLabel, HxWDiv)
     videoDiv.append(div1, div2, div3);
     outerDiv.append(nameDiv, videoDiv)
     formBlock.append(outerDiv);
}

function generateAudioInput()
{
    //Audio 
}

function generateSubsInput()
{
     //Plan out subs block
}

function generateExtraInput()
{
     //Plan out extras block
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

function generateVideoInformationCard(file)
{

    //Name
    let nameDiv = document.createElement("div")
    nameDiv.classList.add("video-name","video-info-block")
    let nameText = document.createElement("p");
    let nameLabel = document.createElement("p");
    nameLabel.textContent = "Name:"
    nameLabel.classList.add("info-label")
    nameText.textContent = videoDetails.name;
    nameDiv.append(nameText,nameLabel)


    //size
    let videoHxLDiv = document.createElement("div");
    videoHxLDiv.classList.add("video-hxl", "video-info-block")
    let videoHxLText = document.createElement("p");
    let videoHxLLabel = document.createElement("p");
    videoHxLLabel.textContent = "Dimensions:"
    videoHxLLabel.classList.add("info-label")
    videoHxLText.textContent = `${videoInfo.streams[0].width} x ${videoInfo.streams[0].height}`
    videoHxLDiv.append(videoHxLText,videoHxLLabel);

    let ExtDiv = document.createElement("div");
    ExtDiv.classList.add("video-ext","video-info-block")
    let ExtText = document.createElement("p");
    let ExtLabel = document.createElement("p");
    ExtLabel.textContent = "Extension:"
    ExtLabel.classList.add("info-label")
    ExtText.textContent = videoDetails.ext;
    ExtDiv.append(ExtText,ExtLabel)

    let DisplayRatioDiv = document.createElement("div");
    DisplayRatioDiv.classList.add("video-ratio", "video-info-block")
    let DisplayRatioText = document.createElement("p");
    let DisplayRatioLabel = document.createElement("p");
    DisplayRatioLabel.textContent = "Aspect Ratio:"
    DisplayRatioLabel.classList.add("info-label")
    DisplayRatioText.textContent = videoInfo.streams[0].display_aspect_ratio;
    DisplayRatioDiv.append(DisplayRatioText, DisplayRatioLabel)

    let amountofStreamsDiv = document.createElement("div");
    amountofStreamsDiv.classList.add("video-streams", "video-info-block")
    let amountofStreamsText = document.createElement("p");
    let amountofStreamsLabel = document.createElement("p");
    amountofStreamsLabel.textContent = "Streams:"
    amountofStreamsLabel.classList.add("info-label")
    amountofStreamsText.textContent = videoInfo.streams.length;
    amountofStreamsDiv.append(amountofStreamsText,amountofStreamsLabel)
    
    let videoLengthDiv = document.createElement("div");
    videoLengthDiv.classList.add("video-length", "video-info-block")
    let videoLengthText = document.createElement("p");
    let videoLengthLabel = document.createElement("p");
    videoLengthText.id = "video-duration"
    videoLengthLabel.textContent = "Duration:"
    videoLengthLabel.classList.add("info-label")
    videoLengthText.textContent = videoDetails.duration;
    videoLengthDiv.append(videoLengthText, videoLengthLabel)

    let videoMemoryDiv = document.createElement("div");
    videoMemoryDiv.classList.add("video-size", "video-info-block")
    let videoMemoryText = document.createElement("p");
    let videoMemoryLabel = document.createElement("p");
    videoMemoryLabel.textContent = "Size:"
    videoMemoryLabel.classList.add("info-label")
    videoMemoryText.textContent = formatSize(videoDetails.size);
    videoMemoryDiv.append(videoMemoryText,videoMemoryLabel)

    videoInfoCard.append(nameDiv,videoHxLDiv,ExtDiv,DisplayRatioDiv,amountofStreamsDiv,videoLengthDiv,videoMemoryDiv)
}


function formatSize(bytes)
{
    if(bytes > 1073741824 )
    {
        let num = bytes/1073741824
        return num.toFixed(2)  + " GB"
    }
    else if(bytes > 1048576)
    {
        let num = bytes/1048576
        return num.toFixed(2)  + " MB"
    }
    else
    {
        let num =  bytes/1024
        return num.toFixed(2) + " KB"
    }
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


function loading(text = "")
{
    if(loadingBG.classList.contains("hide"))
    {
        loadingText.textContent = text
        loadingBG.classList.remove("hide")
    }
    else
    {
       loadingBG.classList.add("hide") 
    }
}

uploadFileButton.addEventListener("click", (e) => {
    e.preventDefault()
    files.click()
})