import Express from 'express'
import cors from 'cors';
import VideoChunkingRouter from '../routes/fileUpload/routes.js'
import videoInfoRouter from '../routes/fileInformation/routes.js'
import { Logger } from '../utils/logger.js';

export const VideoMetaData = new Map()
export const ErrorLogger = new Logger('error','./logs/error.txt');
export const SystemLogger = new Logger('system','./logs/system.txt'); 

const app = Express()
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));


app.use(cors("*"));
SystemLogger.write("System running...")
app.use("/upload",VideoChunkingRouter)
app.use("/videoinfo", videoInfoRouter)

app.listen("3003",() => {
    console.log(`server running on 3003`)
})
