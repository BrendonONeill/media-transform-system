let locationInput = document.getElementById("locationForm");
let nameInput = document.getElementById("nameForm");

export let commandString = ""

export let videoFormInformation = 
{
 location: "",
 streamArrayInformation: [],
 streamArrayString: "", 
 fileName: "",

}


locationInput.addEventListener("change", (e) => {
    videoFormInformation.location = e.target.value.trim();
    console.log("Updated: " +videoFormInformation.location)
})

nameInput.addEventListener("change", (e) => {
    videoFormInformation.name = e.target.value.trim();
    console.log("Updated: " +videoFormInformation.fileName)
})



export function streamsArrayUpdate(streams)
{
    let streamsLen = streams.length;
    videoFormInformation.streamArrayInformation = new Array(streamsLen);
    for(let i = 0; i < streamsLen; i++)
    {
        videoFormInformation.streamArrayInformation[i] = {selected: true, string:`-map 0:${i}`};
    }
    console.log(videoFormInformation.streamArrayInformation)
}

export function streamsArrayUpdateAll(value)
{
    for(let i = 0; i < videoFormInformation.streamArrayInformation.length; i++)
    {
        videoFormInformation.streamArrayInformation[i] = {selected: value};
    }
}
