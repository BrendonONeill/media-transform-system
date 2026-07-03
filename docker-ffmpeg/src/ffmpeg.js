import Express from 'express'
import cors from 'cors';
import VideoChunkingRouter from '../routes/fileUpload/routes.js'
import videoInfoRouter from '../routes/fileInformation/routes.js'
import '../utils/handleCrash.js'
import { Logger } from '../utils/logger.js';
import { CronJob } from 'cron';

export const VideoMetaData = new Map()
export const ErrorLogger = new Logger('error','./logs/error.txt');
export const SystemLogger = new Logger('system','./logs/system.txt'); 
export const FFMPEGLogger = new Logger('ffmpeg','./logs/ffmpeg.txt'); 

const app = Express()
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(cors("*"));
SystemLogger.addToQueue("System running...")
app.use("/upload",VideoChunkingRouter)
app.use("/videoinfo", videoInfoRouter)

app.listen("3003",() => {
    console.log(`server running on 3003`)
})


const job = new CronJob(
	'*/5 * * * *', // cronTime
	function () {
        console.log('Cron was called')
		SystemLogger.cleanupQueue()
	}, // onTick
	null, // onComplete
	true, // start
	'' // timeZone
);