import {generationFile} from '../../utils/createFile.js'
import fs from "node:fs"

export async function receivingChunks(req, res)
{
 console.log("New Chunk received from: ", req.headers['x-original-filename'] );
 const writeStream = fs.createWriteStream(`bucket/${req.headers['x-chunk-number']}__${req.headers['x-original-filename']}`);
 req.pipe(writeStream);
 writeStream.on("finish", () => {
  res.json("success");
 })
 writeStream.on("error", (e) => {
  console.log(e);
  res.json("error");
 })
}

export async function finishedUpload(req, res){
  let fileInformation = req.body
  generationFile(fileInformation)
  res.json("thank you")
}
