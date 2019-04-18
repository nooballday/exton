import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import Debug from '../app/debug-constant'
import { errorExceptionHandler } from '../plugin/errorHandler'

const routes = Router()
/**
 * 
 * @param {boolean} dir_as_path determine will the controller using it's directory name as the routes or not
 * default to true
 * @param {function} error_handler override error handler if you have your own handler,
 *  a controller error handler will be priority rather than global error handler
 */
function expressRoutes(config = { dir_as_path: true, log_route: false }) {
    const routePath = path.join(__dirname, '..', '..', 'controller')
    fs.readdirSync(routePath).forEach((file) => {
        const fileRegex = /^[^.]+.controller.js$/
        const controllerRoute = path.join(routePath, file)
        /**
         * check if the file is a directory 1 level
         * below controller, the directory will be use as
         * grouping label for endpoint inside it
         */
        if (fs.lstatSync(controllerRoute).isDirectory()) {
            /**
             * read every file that has controller.js extension
             * to be registered to routes
             */
            fs.readdirSync(controllerRoute).forEach((controllerFile) => {
                if (fileRegex.test(controllerFile)) {
                    const endPoint = require(path.join(controllerRoute, controllerFile))
                    if (endPoint.path || endPoint.handler) {
                        /**
                         * check if the API will be using
                         * directory inside controller as
                         * prefix on their API endpoint's path
                         * for example if there is user directory inside controller and 
                         * there is login.controller.js endpoint with `/login` will be
                         * transformed to `/user/login` as the final endpoint's path
                         */
                        const endPointPath = `${config.dir_as_path ? `/${file}` : ''}${endPoint.path}`

                        /**
                         * if in dev mode you decide to print registered
                         * endpoint
                         */
                        if (config.log_route) Debug.controller(`--> ${endPointPath} is registered as a route`)

                        /**
                         * registering the endpoint to routes
                         */
                        registerEndpoint(endPoint, endPointPath, {
                            file: file,
                            controller_file: controllerFile
                        })
                    }
                }
            })
        } else {
            Debug.controller(`${file} is not a directory, therefore it's being ignored`)
        }
    })

    return routes
}

function registerEndpoint(endPoint, endPointPath, registerDetail) {
    const errorHandler = errorExceptionHandler(endPoint.handler)
    switch (endPoint.method) {
        case 'USE':
            routes.use(endPointPath, endPoint.middleware, errorHandler)
            break
        case 'POST':
            routes.post(endPointPath, endPoint.middleware, errorHandler)
            break
        case 'GET':
            routes.get(endPointPath, endPoint.middleware, errorHandler)
            break
        case 'PUT':
            routes.put(endPointPath, endPoint.middleware, errorHandler)
            break
        case 'DELETE':
            routes.delete(endPointPath, endPoint.middleware, errorHandler)
            break
        default:
            console.error('\x1b[31m%s\x1b[0m', `Undefined Request Method at ${registerDetail.file}/${registerDetail.controller_file}`)
            process.exit(1)
    }
}

export {
    expressRoutes as routes
}