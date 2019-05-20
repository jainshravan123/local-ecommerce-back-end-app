let express = require('express')
let app = express()
let productRoute = require('./routes/product')
let path = require('path')
let bodyParser = require('body-parser')
var cors = require('cors');

app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body)
    next()
})

app.use(productRoute)
app.use(express.static('public'))

// Handler for 404 - Resource Not Found
app.use((req, res, next) => {
    res.status(404).send('We think you are lost!')
})

// Handler for Error 500
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.sendFile(path.join(__dirname, '../public/500.html'))
})

const PORT = process.env.PORT
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))