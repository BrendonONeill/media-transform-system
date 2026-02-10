import express from 'express'
import {receivingChunks, finishedUpload, finishedUploadffprob, genID} from './index.js'


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

router
.route("/genid")
.get(genID)



export default router