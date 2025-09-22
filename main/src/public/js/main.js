const files = document.getElementById("filesForm");
const submit = document.getElementById("submit");
const locationForm = document.getElementById("locationForm");
const form = document.getElementById("form");

let filesCollection = []

files.addEventListener("change",(e) => {
 filesCollection = []
 filesCollection.push(chunkVideo(e.target.files[0]))
 uploadFileForInfo(filesCollection[0])
})

submit.addEventListener("click", (e) => {
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
        for([index, obj] of chunks.mediaChunks.entries())
        {
            let res =  await fetch("http://localhost:3003/upload/videochunks", {method:"POST", body:obj, headers: {'Content-Type': obj.type, 'Content-Length': obj.size.toString(), 'X-Original-Filename': obj.name.split(".")[0], 'X-Chunk-Number': index},duplex: 'half'})
            console.log(res)
        }
        let res = await fetch("http://localhost:3003/upload/finisheduploadffprob", {method:"POST", body:JSON.stringify({name: chunks.name.split(".")[0], ext: chunks.name.split(".")[1],chunks:chunks.mediaChunks.length - 1}), headers: {'Content-Type': 'application/json'}})
        if(res.ok)
        {
            let data = await res.json()
            generateFormParts()
            console.log(data);
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


function generateFormParts()
{
    let label = document.createElement("label");
    label.append("testing")
    let input = document.createElement("input");
    label.append(input)
    form.append(label)
    let label2 = document.createElement("label");
    label2.append("testing")
    let input2 = document.createElement("input");
    label2.append(input2)
    form.append(label2)
}