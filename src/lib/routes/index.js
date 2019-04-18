import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import Debug from '../app/debug-constant'
import { errorExceptionHandler } from '../plugin/errorHandler'

/**
 * 
 * @param {boolean} dir_as_path determine will the controller using it's directory name as the routes or not
 * default to true
 * @param {function} error_handler override error handler if you have your own handler,
 *  a controller error handler will be priority rather than global error handler
 */
function expressRoutes(config = { dir_as_path: true }) {
    const routes = Router()
    const routePath = path.join(__dirname, '..', '..', 'controller')

    fs.readdirSync(routePath).forEach((file) => {
        const fileRegex = /^[^.]+.controller.js$/
        const controllerRoute = path.join(routePath, file)
        if (fs.lstatSync(controllerRoute).isDirectory()) {
            fs.readdirSync(controllerRoute).forEach((controllerFile) => {
                if (fileRegex.test(controllerFile)) {
                    const endPoint = require(path.join(controllerRoute, controllerFile))
                    if (endPoint.path || endPoint.handler) {
                        const errorHandler = errorExceptionHandler(endPoint.handler)
                        const endPointPath = `${config.dir_as_path ? `/${file}` : ''}${endPoint.path}`
                        switch (endPoint.method) {
                            case 'USE':
                                routes.use(endPointPath, endPoint.middleware, errorExceptionHandler(endPoint.handler))
                                break
                            case 'POST':
                                routes.post(endPointPath, endPoint.middleware, errorExceptionHandler(endPoint.handler))
                                break
                            case 'GET':
                                routes.get(endPointPath, endPoint.middleware, errorHandler)
                                break
                            case 'PUT':
                                routes.put(endPointPath, endPoint.middleware, errorExceptionHandler(endPoint.handler))
                                break
                            case 'DELETE':
                                routes.delete(endPointPath, endPoint.middleware, errorExceptionHandler(endPoint.handler))
                                break
                            default:
                                console.error('\x1b[31m%s\x1b[0m', `Undefined Request Method at ${file}/${controllerFile}`)
                                process.exit(1)
                        }
                    }
                }
            })
        } else {
            Debug.controller(`${file} is not a directory, therefore it's being ignored`)
        }
    })

    return routes
}

export {
    expressRoutes as routes
}