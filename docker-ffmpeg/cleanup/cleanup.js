import fs from 'fs';
import path from 'path';

function logsCleanUp()
{
    const files = ["./logs/system.txt","./logs/ffmpeg.txt","./logs/error.txt"]
    for(let i = 0; i < files.length; i++)
    {
        fs.writeFileSync(files[i],"","utf8")
    }
}

async function foldersCleanUp(dir,keepFile)
{
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
    if (entry.name === keepFile) continue;
    const fullPath = path.join(dir, entry.name);
    await fs.rm(fullPath, { recursive: true, force: true });
    }
}
 


async function main()
{
    logsCleanUp()
    await foldersCleanUp("./temp/IN","info.txt")
    await foldersCleanUp("./temp/OUT","info.txt")
    await foldersCleanUp("./bucket","info.txt")
}

main()