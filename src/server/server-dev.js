import path from 'path'
import express from 'express'
import { createApplication } from './app.js'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import config from '../../webpack.dev.config.js'

const app = express(),
            DIST_DIR = __dirname,
            HTML_FILE = path.join(DIST_DIR, 'index.html'),
            compiler = webpack(config)
console.log('DIST DIR: ', DIST_DIR);
console.log('config.output.publicPath:', config.output.publicPath);
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publiPath
}))
app.get('/', (req, res) => {
    res.sendFile(HTML_FILE)
})
//app.get('*', (req, res, next) => {
//  compiler.outputFileSystem.readFile(HTML_FILE, (err, result) => {
//  if (err) {
//    return next(err)
//  }
//  res.set('content-type', 'text/html')
//  res.send(result)
//  res.end()
//  })
//})
const PORT = process.env.PORT || 4040
app.listen(PORT, (err) => {
    if (err) return console.error(err);
    console.log(`App listening to ${PORT}....`)
    console.log('Press Ctrl+C to quit.')
    return createApplication(app);
})
