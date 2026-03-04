import { updateFFPROBE, videoFormInformation } from "./command.js";
import { generateFormParts } from "./generatingBlocks.js";

const loadingBG = document.getElementById("loading-bg");
const loadingText = document.getElementById("loading-text");
export let videoInfo = ""


export async function uploadFileForInfo(chunks,chunkSizes)
{
    let id;
    console.log("start")
    try {
        let resID = await fetch("http://localhost:3003/upload/genid");
        if(resID.ok)
        {
            let data = await resID.json()
            id = data.id
            console.log(id)
        }
        console.log("[ID ABOVE]")
        loading("Getting video information...")
        console.log(chunks.mediaChunks)
        for(const [index, obj] of chunks.mediaChunks.entries())
        {
            let res =  await fetch("http://localhost:3003/upload/videochunks", {method:"POST", body:obj, headers: {'Content-Type': obj.type, 'Content-Length': obj.size.toString(), 'x-original-filename': obj.name.split(".")[0], 'x-chunk-number': index, 'x-id-number':id},duplex: 'half'})
        }
        let res = await fetch("http://localhost:3003/upload/finisheduploadffprob", {method:"POST", body:JSON.stringify({oldFileName: chunks.name.split(".")[0], ext: chunks.name.split(".")[1],chunks:chunks.mediaChunks.length - 1, chunkSizes, id}), headers: {'Content-Type': 'application/json'}})
        if(res.ok)
        {
            let data = await res.json()
            console.log("LOOK AT ME: ",chunks.mediaChunks[0])
            updateFFPROBE(chunks.mediaChunks[0])
            generateFormParts(data.streams, chunks)
            videoInfo = data;
            videoFormInformation.id = id;
            loading();
        }
    } catch (error) {
        console.log(error)
    }
}



export function loading(text = "")
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