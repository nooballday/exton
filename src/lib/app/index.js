'use strict'

import { config as env } from 'dotenv'

import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import { routes } from '../routes'
import debug from './debug-constant'
import { ErrorEvents as emitter } from '../plugin/errorHandler'

env()

const app = express()

let isErrorHanlder = false

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

function serveStatic(dir, path = '/files') {
    if (!dir) {
        const err = `you should provide static directory, cannot find directory ${dir}`
        debug.app(err)
        throw new Error(err)
    } else {
        const assetsDirectory = dir
        debug.app(`Serving static file at directory ${dir}`)
        fs.existsSync(assetsDirectory) || fs.mkdirSync(assetsDirectory)
        app.use(path, express.static(assetsDirectory))
    }
}

/**
 * 
 * @param {function} fnErrHandler functions should contain 4 
 * parameters (err, req, res, next)
 */
function errorHandler(fnErrHandler) {
    isErrorHanlder = fnErrHandler
}

emitter.on('onControllerError', params => {
    const err = params.err
    const req = params.req
    const res = params.res
    const next = params.next

    debug.controller(`error at controller '${req.url}' ERRMESSAGE ${err}`)

    if (!res.headerSent) {
        if (!isErrorHanlder) {
            res.send({
                status: 500,
                url: process.env.DEBUG ? req.url : undefined,
                message: process.env.DEBUG ? err.message : 'Something went wrong!'
            })
        } else {
            isErrorHanlder(err, req, res, next)
        }
    }
})

export {
    serveStatic,
    debug,
    app,
    routes,
    errorHandler
}