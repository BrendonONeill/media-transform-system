import express from 'express'
import {receivingChunks, finishedUpload} from './index.js'


const router = express.Router()

router
.route("/videochunks")
.post(receivingChunks)


router
.route("/finishedupload")
.post(finishedUpload)


export default router