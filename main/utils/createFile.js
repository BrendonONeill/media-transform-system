import fs from "node:fs"
export  async function generationFile(videoInformation)
{
    try {
        let value = locationCheck(videoInformation.location);
        const writeStream = fs.createWriteStream(value +`${videoInformation.name}.${videoInformation.ext}`);
         console.log("testing i am called too")
        let i = 0;
         while (i <= videoInformation.chunks) {
            const filename = `./bucket/${i}__${videoInformation.id}-${videoInformation.name}`;
            console.log("testing i am called 3")
            // Check if file exists
            if (!fs.existsSync(filename)) {
                
                console.log(`No more files found. Stopped at ${i}`);
                break;
            }
            console.log("passed")
            const readStream = fs.createReadStream(filename);
            
            await new Promise((resolve, reject) => {
                readStream.on('data', chunk => {
                    let end = chunk.length
                    writeStream.write(chunk.subarray(0, end));
                });
                
                readStream.on('end', () => {
                    console.log(`Streamed: ${filename}`);
                    resolve();
                });
                
                readStream.on('error', reject);
            });
            
            i++;
        }
        removeChunks(videoInformation.chunks,`${videoInformation.id}-${videoInformation.name}`)
    } catch (error) {
        
    }
}

export async function chunkCheck(fileInfo)
{
    console.log("checking chunks")
    let delayAmount = [0,30000,60000]
    let delayCount = 0
    let fileAmount = fileInfo.chunks
    let i = 0
    while(i < fileAmount)
    {
        if(delayCount > 0)
        {
            console.log("waiting on chunk...")
            await wait(delayAmount[delayCount]);
        }
        else if(delayCount > 2)
        {
            return false
        }
        let check = fs.existsSync(`./bucket/${i}__${fileInfo.id}-${fileInfo.name}`)
        if(check)
        {
            i++
            delayCount = 0
        }
        else
        {
            delayCount++
        }
    }
    console.log("All chunks have transferred over");
    return true
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function locationCheck(name)
{
    if(name === "")
    {
         return './videos/'
    }
    else
    {
        return name
    }
}

function removeChunks(chunks,name)
{
    let i = 0
    while (i <= chunks) {
            const filename = `./bucket/${i}__${name}`;

            if (!fs.existsSync(filename)) {
                
                console.log(`No more files found. Stopped at ${i}`);
                break;
            }
            fs.rmSync(filename)
            i++;
        }
}