const presets = [
    "es2015"
]

const plugins = [
    "add-module-exports"
]

if (process.env.STAGE === 'production') {
    presets.push({
        comments: false
    })
    presets.push("minify")
    plugins.push(["transform-remove-console", { "exclude": ["warn"] }])
}

module.exports = { presets, plugins }