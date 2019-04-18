module.exports = {
    method: 'GET',
    path: '/:name',
    handler: function (req, res) { //handler can be separate it doesnt have to be inline here
        const name = req.params.name
        res.send({
            name: name,
            message: `Hey ${name}!!`
        })
    },
    middleware: [

    ]
}