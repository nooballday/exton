import debug from 'debug'
import { Server } from './lib'

/**
 * if you want to have custom error handler use below function to hookup
 * your function to catch any uncaught exception in your controller, there is a default
 * if you are not setting up this function
 * set this function on top of your entry.js file to succesfully overriding error handler
 */
Server.errorHandler(function (err, req, res, next) {
    res.send({
        custom_error : `there is an error in ${req.url} with message : ${err}`
    })
})

/**
 * app is an express instance,
 * while the routes is the controller, if you chose to create your own routes just add it to 'app'
 * as you would an express server
 */

const app = Server.app
const routes = Server.routes({
    dir_as_path: true,
    log_route: true
})

app.use('/api/v1', routes)

app.listen(process.env.SERVER_PORT, () => {
    debug('server:init')(`server running at port : ${process.env.SERVER_PORT} at ${new Date()}`)
})