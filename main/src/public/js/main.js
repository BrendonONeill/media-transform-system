const files = document.getElementById("filesForm");
const submit = document.getElementById("submit");

let filesCollection = []




files.addEventListener("change", (e) => {
 filesCollection = e.target.files
})

submit.addEventListener("click", (e) => {
    e.preventDefault()
    upload()
})


async function upload()
{
    let count = 0 
    while(count <= filesCollection.length - 1)
    {
        let chunks = chunkVideo(filesCollection[count])
        uploadPrep(chunks)
        count++
    }

}

async function uploadPrep(chunksObj)
{
    console.log(chunksObj)
    return
    let chunks = chunksObj.numberOfChunks - 1
    let chunksObjArr = chunksObj.mediaChunks
    let count = 0
    let arrChunks = []
    while(count <= chunks)
    {
        if(arrChunks.length < 3)
        {
            arrChunks.push({chunk:chunksObjArr[count],id:count})
        }
        else
        {
            arrChunks = await uploadFetch(arrChunks) 
        }
        count++
    }
    if(arrChunks.length > 0)
    {
        arrChunks = uploadFetch(arrChunks)
    }
    let res = await fetch("http://localhost:3006/", {method:"POST", body:JSON.stringify({folder: chunksObj.name.split(".")[0], ext: chunksObj.name.split(".")[1]}), headers: {'Content-Type': 'application/json'}})
}

async function uploadFetch(arrChunks)
{
    try {
        let taskPromises = []
        
        for (const obj of arrChunks) {
        const promise = await fetch("http://localhost:3006/", {method:"POST", body:obj.chunk, headers: {'Content-Type': obj.chunk.type, 'Content-Length': obj.chunk.size.toString(), 'X-Original-Filename': obj.chunk.name.split(".")[0], 'X-Chunk-Number': obj.id},duplex: 'half'})
        taskPromises.push(promise);
        }

        const results = await Promise.all(taskPromises);
        console.log(results)
        return []
        
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


