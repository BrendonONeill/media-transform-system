
import fs from "node:fs"


export async function getFileInformation(req, res)
{
   console.log("Received video file: ", req.headers['x-original-filename'] );
   const writeStream = fs.createWriteStream(`temp/${req.headers['x-original-filename']}`);
   req.pipe(writeStream)
   writeStream.on("finish", () => {
    res.json("success")
   })
   writeStream.on("error", (e) => {
    console.log(e)
    res.json("error")
   })
}
