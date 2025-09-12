import Express from 'express'
import cors from 'cors';
import VideoChunkingRouter from '../routes/fileUpload/routes.js'

const app = Express()
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));


app.use(cors("*"));

app.use("/upload",VideoChunkingRouter)

app.listen("3003",() => {
    console.log(`server running on 3003`)
})
