import { videoDetails} from "./main.js";
import { videoInfo } from "./sendToFFPROBE.js";

const videoNameBlockText = document.querySelector(".video-name-p");
const videoExtBlockText = document.querySelector(".video-ext-p");
const videoDimensionsBlockText = document.querySelector(".video-hxl-p");
const videoRatioBlockText = document.querySelector(".video-ratio-p");
const videoStreamsBlockText = document.querySelector(".video-streams-p");
const videoDurationBlockText = document.querySelector(".video-length-p");
const videoSizeBlockText = document.querySelector(".video-size-p");
const videoImageBlock = document.querySelector(".video-image");



const formBlock = document.getElementById("generated-blocks-container");



export function generateVideoInformationCard(file)
{

    //Name
    videoNameBlockText.textContent  = videoDetails.name;

    //size
    videoDimensionsBlockText.textContent = `${videoInfo.streams[0].width} x ${videoInfo.streams[0].height}`
    
    //ext
    videoExtBlockText.textContent = videoDetails.ext;

    //ratio
    videoRatioBlockText.textContent = videoInfo.streams[0].display_aspect_ratio;
    
    // streams
    videoStreamsBlockText.textContent = videoInfo.streams.length;
    
    //duration
    videoDurationBlockText.textContent = videoDetails.duration;

    // size
    videoSizeBlockText.textContent = formatSize(videoDetails.size);

    videoImageBlock.style.background = "#ffffff"
}


export function generateFormParts(streams,file)
{
    generateVideoInput(streams[0],file)
    generateAudioInput(streams[1])
}

function generateBlockForStream(type,index,)
{
     const outerDiv = document.createElement("div");
     outerDiv.classList.add("outer-div")
     const nameDiv = document.createElement("div");
     nameDiv.innerHTML = `<h3>Stream ${index}: ${type}</h3>`;
     nameDiv.classList.add("gen-div-name");

     const ContentDiv = document.createElement("div");
     ContentDiv.classList.add("gen-div")

     const div1 = document.createElement("div"); 
     const div2 = document.createElement("div"); 
     const div3 = document.createElement("div");
     div1.classList.add("gen-div-content", "content-1"); 
     div2.classList.add("gen-div-content", "content-2"); 
     div3.classList.add("gen-div-content", "content-3");
     ContentDiv.append(div1,div2,div3)
     outerDiv.append(nameDiv, ContentDiv)
     return outerDiv
}


function generateVideoInput(videoStream, videoFileInfo)
{
     const outerDiv = generateBlockForStream("Video",0)

     const extensionType = document.createElement("p");
     const checkboxExtensionLabel = document.createElement("label")
     const checkboxExtension = document.createElement("input")

     const extensionDiv = document.createElement("div");
     const extensionSelectLabel = document.createElement("label");
     const extensionSelect = document.createElement("select");
     console.log(videoFileInfo)
     extensionType.textContent = `Extension: ${videoFileInfo.type.split("/")[1]}`;
     
     checkboxExtension.type = 'checkbox';
     checkboxExtension.checked = true;
     checkboxExtension.id = 'checkboxExtension';
     checkboxExtensionLabel.append("Keep Extension the same",checkboxExtension);

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

     let fpsScore = (Number(videoStream.r_frame_rate.split("/")[0]) / Number(videoStream.r_frame_rate.split("/")[1])).toFixed(2)
     FPSType.textContent = `FPS: ${fpsScore}`;

     checkboxFPS.type = 'checkbox';
     checkboxFPS.checked = true;
     checkboxFPS.id = 'checkboxFPS';
     checkboxFPSLabel.append("Keep FPS the same",checkboxFPS);

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
     console.log(outerDiv)
     outerDiv.querySelector(".content-1").append(extensionType, checkboxExtensionLabel, extensionDiv);
     outerDiv.querySelector(".content-2").append(FPSType, checkboxFPSLabel, FPSDiv);
     outerDiv.querySelector(".content-3").append(HxWType, checkboxHxWLabel, HxWDiv);
     formBlock.append(outerDiv);
}


export function generateAudioInput(audioStream)
{
     const outerDiv = generateBlockForStream("Audio",1);

     const bitRateType = document.createElement("p");
     const checkboxbitRateLabel = document.createElement("label")
     const checkboxbitRate = document.createElement("input")

     const bitRateDiv = document.createElement("div");
     const bitRateSelectLabel = document.createElement("label");
     const bitRateSelect = document.createElement("input");
     bitRateSelect.disabled = true

     bitRateType.textContent = `Bit-Rate: ${audioStream.bit_rate}`;

     checkboxbitRate.type = 'checkbox';
     checkboxbitRate.checked = true;
     checkboxbitRate.id = 'checkboxbitRate';
     checkboxbitRateLabel.append("Keep bit rate the same",checkboxbitRate);

     bitRateSelect.type = "number";
     bitRateSelect.value = audioStream.bit_rate;
     bitRateDiv.classList.add("disabled")
     bitRateSelectLabel.append("Bit-Rate: ", bitRateSelect);
     bitRateDiv.append(bitRateSelectLabel);

     checkboxbitRate.addEventListener("click", () => {
        if(checkboxbitRate.checked)
        {
            bitRateSelect.disabled = true
            bitRateDiv.classList.add("disabled")
        }
        else
        {
            bitRateSelect.disabled = false
            bitRateDiv.classList.remove("disabled")
        }
     })

     outerDiv.querySelector(".content-1").append(bitRateType, checkboxbitRateLabel, bitRateDiv);
     formBlock.append(outerDiv);
}

export function generateSubsInput()
{
     //Plan out subs block
}

export function generateExtraInput()
{
     //Plan out extras block
}



export function formatSize(bytes)
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