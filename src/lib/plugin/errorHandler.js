import Events from 'events'

const emitter = new Events()

const errorExceptionHandler = fn => (req, res, next) => {
    fn(req, res, next).catch((err) => {
        emitter.emit('onControllerError', {
            err: err,
            req: req,
            res: res,
            next: next
        })
    })
}

export {
    errorExceptionHandler,
    emitter as ErrorEvents
}