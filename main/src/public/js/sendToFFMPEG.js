import {videoFormInformation} from './command.js'

//submit 1
export async function upload(filesCollection,cb)
{
    let count = 0 
    while(count <= filesCollection.length - 1)
    {
        cb(filesCollection[count], videoFormInformation.id)
        count++
    }

}

//submit 2
export async function uploadPrep(chunksObj,id)
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
            arrChunks = await uploadFetch(arrChunks,id) 
        }
        
    }
    if(arrChunks.length > 0)
    {
        arrChunks = uploadFetch(arrChunks,id)
    }
    try {
        videoFormInformation.chunks = chunks;
        let finishedUploadObj = videoFormInformation;
        console.log(finishedUploadObj)
        let res = await fetch("http://localhost:3003/upload/finishedupload", {method:"POST", body:JSON.stringify(finishedUploadObj), headers: {'Content-Type': 'application/json'}})
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
        let res = await fetch("http://localhost:3000/return/setlocation", {method:"POST", body:JSON.stringify({name: chunksObj.name, location: videoFormInformation.location}), headers: {'Content-Type': 'application/json'}})
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

//submit 3
async function uploadFetch(arrChunks,id)
{
    try {
        let taskPromises = []
        
        for (const obj of arrChunks) {
        const promise = fetch("http://localhost:3003/upload/videochunks", {method:"POST", body:obj.chunk, headers: {'Content-Type': obj.chunk.type, 'Content-Length': obj.chunk.size.toString(), 'x-original-filename': obj.chunk.name.split(".")[0], 'x-chunk-number': obj.id, 'x-id-number':id},duplex: 'half'})
        taskPromises.push(promise);
        }

        const results = await Promise.all(taskPromises);
        console.log(results)
        return []
        
    } catch (error) {
        console.log(error)
    }
    
}