import express from 'express'
import {receivingChunks, finishedUpload, finishedUploadffprob} from './index.js'


const router = express.Router()

router
.route("/videochunks")
.post(receivingChunks)


router
.route("/finishedupload")
.post(finishedUpload)

router
.route("/finisheduploadffprob")
.post(finishedUploadffprob)



export default router