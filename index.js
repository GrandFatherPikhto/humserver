import express from 'express'
// import bodyParser from 'body-parser'
import formData from 'express-form-data'

import path from 'path'
import serverRoutes from './routes/humidity.js'

import { createStorage } from "./data/sensorsdb.js"
import {uploadDatabaseFile} from "./data/yandex.js";

const __dirname = path.resolve()
const PORT = process.env.PORT ?? 3000
const app = express()

app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))

app.use('/', express.static(path.resolve(__dirname, 'node_modules/')))
app.use(express.static(path.resolve(__dirname, 'node_modules/simple-ajax-vanilla/src')))
app.use('/', express.static(path.resolve(__dirname, 'static')))
app.use('/', express.static(path.resolve(__dirname, 'static/js')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(serverRoutes)

app.get('/', (req, res) => {
    res.render('index', { title: 'Humidity Data', active: 'main'})
})

app.get('/test/', (req, res) => {
    res.render('test', {title: 'Humidity test', active: 'main'})
})

app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}`)
})
