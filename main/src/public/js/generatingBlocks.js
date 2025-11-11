import { streamsArrayUpdate, streamsArrayUpdateAll, videoFormInformation } from "./command.js";
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
const allSelectionButton = document.querySelector(".all-selection");

let allStreamsContainers = null;
let selectedCheckBoxs = "";

allSelectionButton.addEventListener("click", (e) => selectedCheckBoxsHandler(e))


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
    streamsArrayUpdate(streams)
    for(let i = 0; i < streams.length; i++)
    {
        let codecType = streams[i].codec_type
        if(codecType === "video")
        {
            generateVideoInput(streams[i],file,i)
        }
        if(codecType === "audio")
        {
            generateAudioInput(streams[i],i)
        }
        if(codecType === "subtitle")
        {
            generateSubsInput(streams[i],i)
        }
        if(codecType === "attachment")
        {
            generateExtraInput(streams[i],i)
        }
    }
    allStreamsContainers = document.querySelectorAll(".generated-stream-block");
    console.log(allStreamsContainers)
    testingIdea()

    //selectedCheckBoxs = document.querySelectorAll(".selectedStream")
    //addActionOnCheckbox()    
}

function generateBlockForStream(type,index)
{
     const outerDiv = document.createElement("div");
     outerDiv.classList.add("outer-div", "generated-stream-block")
     outerDiv.dataset.stream = index;
     const nameDiv = document.createElement("div");
     const nameDivName = document.createElement("h3");
     nameDivName.textContent = `Stream ${index}: ${type}`;
     const namDivLabel = document.createElement("label");
     namDivLabel.innerHTML = `selected <input class="selectedStream" data-stream=${index} type="checkbox" checked></input>`
     nameDiv.append(nameDivName, namDivLabel);
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


function generateVideoInput(videoStream, videoFileInfo,index)
{
     const outerDiv = generateBlockForStream("Video",index)

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
     checkboxExtension.classList.add('checkboxExtension');
     checkboxExtensionLabel.append("Keep Extension the same",checkboxExtension);

     extensionSelect.classList.add("selectVideoExt");
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
     checkboxFPS.classList.add('checkboxFPS');
     checkboxFPSLabel.append("Keep FPS the same",checkboxFPS);

     FPSSelect.type = "number";
     FPSSelect.step = "0.01";
     FPSSelect.value = fpsScore;
     FPSSelect.classList.add("changeFPSValue");
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
     checkboxHxW.classList.add('checkboxHxW');
     checkboxHxWLabel.append("Keep Height and Width the same ",checkboxHxW);

     HSelect.type = "number";
     HSelect.classList.add("heightValue");
     WSelect.type = "number";
     WSelect.classList.add("widthValue");
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


export function generateAudioInput(audioStream,index)
{
     const outerDiv = generateBlockForStream("Audio",index);

     const channels = document.createElement("p");
     const checkboxChannelsLabel = document.createElement("label");
     const checkboxChannels = document.createElement("input");
     const divChannels = document.createElement("div");
     const labelSelectChannels = document.createElement("label");
     const selectChannels = document.createElement("select");

     channels.textContent = `Channels: ${audioStream.channel_layout}`

     checkboxChannels.type = 'checkbox';
     checkboxChannels.checked = true;
     checkboxChannels.classList.add('checkboxChannels');
     checkboxChannelsLabel.append("Keep Channels the same",checkboxChannels);

     selectChannels.classList.add("selectChannel")
     selectChannels.innerHTML = 
     `
        <option value="mono" selected>Mono</option>
        <option value="stereo">Stereo</option>
        <option value="2.1">2.1</option>
        <option value="5.1">5.1</option>
        <option value="7.1">7.1</option>
     `
     selectChannels.disabled = true;
     divChannels.classList.add("disabled");
     labelSelectChannels.append("Channels: ",selectChannels);
     divChannels.append(labelSelectChannels);

     checkboxChannels.addEventListener("click", () => {
        if(checkboxChannels.checked)
        {
            selectChannels.disabled = true
            divChannels.classList.add("disabled")
        }
        else
        {
            selectChannels.disabled = false
            divChannels.classList.remove("disabled")
        }
     })

     const codecAudio = document.createElement("p");
     const sampleRate = document.createElement("p");

     codecAudio.textContent = `Codec: ${audioStream.codec_long_name}`;
     sampleRate.textContent = `Sample Rate: ${audioStream.sample_rate}Hz`;

     const tags = document.createElement("h3");
     const tagsLang = document.createElement("p");
     tags.textContent = "Tags:"
     tagsLang.textContent = `Language: ${audioStream.tags.language}`


     outerDiv.querySelector(".content-1").append(channels,checkboxChannelsLabel,divChannels);
     outerDiv.querySelector(".content-2").append(codecAudio,sampleRate);
     outerDiv.querySelector(".content-3").append(tags,tagsLang);
     formBlock.append(outerDiv);
}

export function generateSubsInput(subtitleStream,index)
{
     const outerDiv = generateBlockForStream("Subtitle",index);

     const subtitleType = document.createElement("p");
     subtitleType.textContent = `Codec: ${subtitleStream.codec_long_name}`

     const tags = document.createElement("h3");
     const tagsLang = document.createElement("p");
     tags.textContent = "Tags:"
     tagsLang.textContent = `Language: ${subtitleStream.tags.language}`

     outerDiv.querySelector(".content-1").append(subtitleType);
     outerDiv.querySelector(".content-2").append(tags,tagsLang);

     formBlock.append(outerDiv);
}

export function generateExtraInput(attachmentStream,index)
{
     const outerDiv = generateBlockForStream("Attachment",index);
     
     const tags = document.createElement("h3");
     const tagsFileName = document.createElement("p");
     const tagsMime = document.createElement("p");
     tags.textContent = "Tags:"
     tagsFileName.textContent = `File Name: ${attachmentStream.tags.filename}`;
     tagsMime.textContent = `Mimetype: ${attachmentStream.tags.mimetype}`;

      outerDiv.querySelector(".content-1").append(tags,tagsFileName,tagsMime);
     formBlock.append(outerDiv);
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

function selectedCheckBoxsHandler(eve)
{
   eve.preventDefault()
   if(selectedCheckBoxs !== "")
   {
    if(allSelectionButton.textContent == "Deselect All")
    {
        allSelectionButton.textContent = "Select All"
        selectedCheckBoxs.forEach((checkbox) => {
        streamsArrayUpdateAll(false);
        checkbox.checked = false
    })
    }
    else
    {
        allSelectionButton.textContent = "Deselect All"
        selectedCheckBoxs.forEach((checkbox) => {
        streamsArrayUpdateAll(true);
        checkbox.checked = true;
    })
    }
    
   }
}


export function streamBlocksReset()
{
    formBlock.innerHTML = "";
}


function testingIdea()
{
    allStreamsContainers.forEach((streamContainer) => {
        streamContainer.addEventListener("change", (e) => {
            if(e.target.classList.contains("selectedStream"))
            {
                handleStreamSelectedCheckbox(e.target.dataset.stream,e.target.checked)
                return
            }
            let streamType = streamContainer.querySelector("h3").textContent
            let index = streamContainer.querySelector(".selectedStream").dataset.stream
            if(streamType.endsWith("Video"))
            {
                // Run this function
                handleVideoStreamUpdates(index, e.target, streamContainer)
            }
            else if(streamType.endsWith("Audio"))
            {
                // Run this function
                handleAudioStreamUpdates(index, e.target)
            }
            else if(streamType.endsWith("Subtitle"))
            {
                // Run this function
            }
            else
            {
                // Run this function
            }
        })
    })
}

// remove don't need anymore



function handleStreamSelectedCheckbox(index,isChecked)
{
    if(isChecked)
    {
        videoFormInformation.streamArrayInformation[index].selected = true;
    }
    else
    {
        videoFormInformation.streamArrayInformation[index].selected = false;
    }
    console.log(videoFormInformation.streamArrayInformation[index]);
}

function handleVideoStreamUpdates(index, target,parent)
{
    console.log("Video target: ",target.classList)
    if(target.classList.contains("checkboxExtension") || target.classList.contains("checkboxFPS") || target.classList.contains("checkboxHxW"))
    {
        const checkboxExtension = parent.querySelector(".checkboxExtension");
        const checkboxFPS = parent.querySelector(".checkboxFPS");
        const checkboxHxW = parent.querySelector(".checkboxHxW");
        console.log(videoFormInformation.streamArrayInformation[index])
        if(checkboxExtension.checked === true && checkboxFPS.checked == true && checkboxHxW.checked === true)
        {
            console.log("Video Stream is the same")
            videoFormInformation.streamArrayInformation[index].edited = false
        }
        else
        {
            videoFormInformation.streamArrayInformation[index].edited = true
            console.log("Video Stream edited")
        }   
    }
    if(target.classList.contains("selectVideoExt"))
    {
        videoFormInformation.streamArrayInformation[index].ext = target.value;
        console.log(videoFormInformation.streamArrayInformation[index])
    }
    if(target.classList.contains("changeFPSValue"))
    {
        videoFormInformation.streamArrayInformation[index].fps = target.value;
        console.log(videoFormInformation.streamArrayInformation[index])
    }
    if(target.classList.contains("heightValue"))
    {
        videoFormInformation.streamArrayInformation[index].height = target.value;
        console.log(videoFormInformation.streamArrayInformation[index])
    }
    if(target.classList.contains("widthValue"))
    {
        videoFormInformation.streamArrayInformation[index].width = target.value;
        console.log(videoFormInformation.streamArrayInformation[index])
    }
}

function handleAudioStreamUpdates(index, target)
{
    if(target.classList.contains("checkboxChannels"))
    {
        if(target.checked)
        {
            console.log("Video Stream is the same")
            videoFormInformation.streamArrayInformation[index].edited = false
        }
        else
        {
            videoFormInformation.streamArrayInformation[index].edited = true
            console.log("Video Stream edited")
        } 
    }
    if(target.classList.contains("selectChannel"))
    {
        videoFormInformation.streamArrayInformation[index].channel = target.value;
        console.log(videoFormInformation.streamArrayInformation[index])
    }
}
