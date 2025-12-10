import fs from "node:fs"


export  async function generationFile(videoInformation)
{
    // Rewrite this function to make sure chunks go into file
    try {
        console.log("Creating video from chunks")
        let value = locationCheck(videoInformation.location);
        const writeStream = fs.createWriteStream(value +`${videoInformation.name}.${videoInformation.ext}`);

        for(let i = 0; i <= videoInformation.chunks; i++)
        {
            const chunkFile = `./bucket/${i}__${videoInformation.id}-${videoInformation.name}`;
            if (!fs.existsSync(chunkFile)) {
                console.log(`No more files found. Stopped at ${i}/${videoInformation.chunks}`);
                break;
            }

            await new Promise((resolve, reject) => {
                const readStream = fs.createReadStream(chunkFile);

                readStream.on("error", (err) => {
                    console.log(err);
                    reject();
                })

                readStream.on("data", (chunk) => {
                // Handle backpressure
                if (!writeStream.write(chunk)) {
                readStream.pause();
                writeStream.once("drain", () => readStream.resume());
                }
                });

                readStream.on("end", () => {
                    console.log(`---------------------`);
                    console.log(`Streamed: ${chunkFile}`);
                    console.log(`---------------------`);
                    resolve();
                });
            })
        }

        await new Promise((resolve, reject) => {
                writeStream.end();
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
        });
        removeChunks(videoInformation.chunks,videoInformation.name,videoInformation.id);
    } catch (error) {
        
    }
}


export async function chunkCheck(fileInfo)
{
    console.log("Checking chunks...");

    const maxRetries = 4;
    const delayAmounts = [0, 3000, 5000, 15000, 30000];
    const totalChunks = fileInfo.chunks + 1;

    for (let i = 0; i < totalChunks; i++)
    {
        const chunkPath = `./bucket/${i}__${fileInfo.id}-${fileInfo.name}`;
        let retryCount = 0;

        while (retryCount < maxRetries)
        {
            if(fs.existsSync(chunkPath))
            {
                const stats = fs.statSync(chunkPath);
                console.log("file size: ",stats.size," looking for size: ",fileInfo.chunkSizes[i])
                if(stats.size == fileInfo.chunkSizes[i])
                {
                     console.log(`✓ Chunk ${i}/${fileInfo.chunks}: ${stats.size} bytes`);
                     break;
                }
            }

            retryCount++;

            if (retryCount < maxRetries) {
                const delay = delayAmounts[retryCount];
            console.log( `✗ Chunk ${i} missing. Retry ${retryCount}/${maxRetries} ` + `in ${delay}ms...`);
            await wait(delay);
            } else {
                console.error(`✗ Chunk ${i} failed after ${maxRetries} retries`);
                return false;
            }
        }

    }

    console.log(`✓ All ${totalChunks} chunks verified`);
    return true;
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

function removeChunks(chunks,name,id)
{
    let i = 0
    while (i <= chunks) {
            const filename = `./bucket/${i}__${id}-${name}`;

            if (!fs.existsSync(filename)) {
                
                console.log(`No more files found. Stopped at ${i}`);
                break;
            }
            fs.rmSync(filename)
            i++;
        }
}