import express from 'express'
import {receivingChunks, finishedUpload, setLocation} from './index.js'


const router = express.Router()

router
.route("/videochunks")
.post(receivingChunks)


router
.route("/finishedupload")
.post(finishedUpload)

router
.route("/setlocation")
.post(setLocation)



export default router