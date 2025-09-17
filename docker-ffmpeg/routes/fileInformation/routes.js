import express from 'express'
import {getFileInformation} from './index.js'


const router = express.Router()

router
.route("/")
.post(getFileInformation)




export default router