import fs from "node:fs"
import { main } from '../utils/ffmpeg.js'

export  async function generationFile(videoInformation)
{
    try {
        console.log("testing i am called")
        const writeStream = fs.createWriteStream(`./temp/${videoInformation.name}.${videoInformation.ext}`);
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
main(`${videoInformation.name}.${videoInformation.ext}`)

    } catch (error) {
        
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


async function chunkFileAndSendChunks()
{

}