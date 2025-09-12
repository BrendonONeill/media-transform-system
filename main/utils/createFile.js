import fs from "node:fs"
import { Location } from "../src/index.js";

export  async function generationFile(videoInformation)
{
    try {
        console.log("testing i am called")
        let value = locationCheck(`${videoInformation.name}.${videoInformation.ext}`)
        const writeStream = fs.createWriteStream(value +`${videoInformation.name}.${videoInformation.ext}`);
         console.log("testing i am called too")
        let i = 0;
         while (i <= videoInformation.chunks) {
            const filename = `./bucket/${i}__${videoInformation.name}`;
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
                    writeStream.write(chunk.subarray(0, chunk.length));
                });
                
                readStream.on('end', () => {
                    console.log(`Streamed: ${filename}`);
                    resolve();
                });
                
                readStream.on('error', reject);
            });
            
            i++;
        }
        removeChunks(videoInformation.chunks,videoInformation.name)
    } catch (error) {
        
    }
}

function locationCheck(name)
{
    if(!Location[name])
    {
         return './videos/'
    }
    else
    {
        return Location[name]
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