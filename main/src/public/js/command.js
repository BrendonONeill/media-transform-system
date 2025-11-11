let locationInput = document.getElementById("locationForm");
let nameInput = document.getElementById("nameForm");

export let commandString = ""

export let videoFormInformation = 
{
 id: "",
 location: "",
 streamArrayInformation: [],
 ext:"",
 oldFileName: "", 
 fileName: "",
 chunks: 0,
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
            videoFormInformation.streamArrayInformation[i] = {selected: true, string:`-map 0:${i}`, edited: false, ext: 'mp4', fps: fpsScore, height: streams[i].coded_height, width: streams[i].coded_width};
        }
        else if(streams[i].codec_type === "audio")
        {
            videoFormInformation.streamArrayInformation[i] = {selected: true, string:`-map 0:${i}`, edited: false, channel: streams[i].channel_layout};
        }
        else if(streams[i].codec_type === "subtitle" || streams[i].codec_type === "attachment")
        {
            videoFormInformation.streamArrayInformation[i] = {selected: true, string:`-map 0:${i}`};
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
