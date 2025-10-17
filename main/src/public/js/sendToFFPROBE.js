import { generateFormParts } from "./generatingBlocks.js";

const loadingBG = document.getElementById("loading-bg");
const loadingText = document.getElementById("loading-text");
export let videoInfo = ""


export async function uploadFileForInfo(chunks)
{
    try {
        loading("Getting video information...")
        console.log(chunks.mediaChunks)
        for(const [index, obj] of chunks.mediaChunks.entries())
        {
            let res =  await fetch("http://localhost:3003/upload/videochunks", {method:"POST", body:obj, headers: {'Content-Type': obj.type, 'Content-Length': obj.size.toString(), 'X-Original-Filename': obj.name.split(".")[0], 'X-Chunk-Number': index},duplex: 'half'})
            console.log(res)
        }
        let res = await fetch("http://localhost:3003/upload/finisheduploadffprob", {method:"POST", body:JSON.stringify({name: chunks.name.split(".")[0], ext: chunks.name.split(".")[1],chunks:chunks.mediaChunks.length - 1}), headers: {'Content-Type': 'application/json'}})
        if(res.ok)
        {
            let data = await res.json()
            generateFormParts(data.streams, chunks)
            console.log(data);
            videoInfo = data;
            loading()
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