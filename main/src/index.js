import Express from "express"
import 'dotenv/config'
import cors from 'cors';
import path from 'path'
import { dirname} from 'path';
import { fileURLToPath } from 'url';
import videoReturnedRouter from './Routes/fileCreation/routes.js'
import { Logger } from "../utils/logger.js";

export const ErrorLogger = new Logger('error','./logs/clientError.txt');
export const SystemLogger = new Logger('system','./logs/clientSystem.txt'); 

const app = Express()

app.use(cors("*"));

export const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(Express.json({}));
app.use(Express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use('/', Express.static(path.join(__dirname, 'public')));


app.use("/return", videoReturnedRouter)


app.listen("3000", () => {
    SystemLogger.write("Server started")
    console.log("app listening on 3000")
})
