import { videoDetails } from "./main.js";

let extType;
let locationInput = document.getElementById("locationForm");
let nameInput = document.getElementById("nameForm");


export let commandString = ""

export let videoFormInformation = 
{
 id: "",
 location: "",
 streamArrayInformation: [],
 ext:"",
 newExt:"",
 oldFileName: "", 
 fileName: "",
 encoded: "false",
 chunks: 0,
 chunkSizes: [],
 inputFile:"",
 outputFile:"",
}


locationInput.addEventListener("change", (e) => {
    videoFormInformation.location = e.target.value.trim();
    console.log("Updated: " +videoFormInformation.location)
})

nameInput.addEventListener("change", (e) => {
    videoFormInformation.fileName = e.target.value.trim();
    console.log("Updated: " +videoFormInformation.fileName)
})


// Set up streamArrayInformation
export function streamsArrayUpdate(streams)
{
    console.log("testing......")
    console.log(streams)
    let streamsLen = streams.length;
    videoFormInformation.streamArrayInformation = new Array(streamsLen);
    for(let i = 0; i < streamsLen; i++)
    {
        if(streams[i].codec_type === "video")
        {
            let fpsScore = (Number(streams[i].r_frame_rate.split("/")[0]) / Number(streams[i].r_frame_rate.split("/")[1])).toFixed(2)        
            videoFormInformation.streamArrayInformation[i] = { type:'video', selected: true, string:`-map 0:${i}`, edited: false, ext: extType, defaultExt: extType, fps: fpsScore, defaultFPS: fpsScore, height: streams[i].coded_height, defaultHeight: streams[i].coded_height, width: streams[i].coded_width, defaultWidth: streams[i].coded_width, editedValues:[]};
        }
        else if(streams[i].codec_type === "audio")
        {
            videoFormInformation.streamArrayInformation[i] = {type: 'audio',selected: true, string:`-map 0:${i}`, edited: false, channel: streams[i].channel_layout, editedValues:[]};
        }
        else if(streams[i].codec_type === "subtitle")
        {
            videoFormInformation.streamArrayInformation[i] = {type: 'subtitle',selected: true, string:`-map 0:${i}`, edited: false, editedValues:[]};
        }
        else if(streams[i].codec_type === "attachment")
        {
            videoFormInformation.streamArrayInformation[i] = {type:'attachment',selected: true, string:`-map 0:${i}`, edited: false};
        }
        
    }
    console.log(videoFormInformation.streamArrayInformation)
}

// Change all values within streamArrayInformation
export function streamsArrayUpdateAll(value)
{
    for(let i = 0; i < videoFormInformation.streamArrayInformation.length; i++)
    {
        videoFormInformation.streamArrayInformation[i] = {selected: value};
    }
}


export function updateFFPROBE(data)
{
    extType = data.type  === "video/x-matroska" ? "mkv" : data.type === "video/mp4" ? "mp4" : data.type === "video/quicktime" ? "mov" : "mp4";
    console.log("[ Should be first ]")
    videoFormInformation.newExt = "";
    videoFormInformation.ext = extType
    videoFormInformation.oldFileName = data.name.split(".")[0];
}
