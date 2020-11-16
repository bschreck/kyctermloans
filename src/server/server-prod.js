import path from 'path'
import express from 'express'
import { createApplication } from './app.js'

const app = express(),
            DIST_DIR = __dirname,
            HTML_FILE = path.join(DIST_DIR, 'index.html')
app.use(express.static(DIST_DIR))
app.get('/', (req, res) => {
    res.sendFile(HTML_FILE)
})
const PORT = process.env.PORT || 4040
app.listen(PORT, (err) => {
    if (err) return console.error(err);
    console.log(`App listening to ${PORT}....`)
    console.log('Press Ctrl+C to quit.')
    return createApplication(app);
})
