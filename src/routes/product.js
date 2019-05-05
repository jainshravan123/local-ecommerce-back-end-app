let ProductModel = require('../models/product.model')

let express = require('express')
const PDFDocument = require('pdfkit')
const path = require('path')
const fs = require('fs')
const multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' +file.originalname )
    }
})

var upload = multer({ storage: storage }).array('file')

let router = express.Router()

function writeToPdfFile (pdfFileName) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument;
            doc.pipe(fs.createWriteStream(pdfFileName))
            doc.fontSize(15).text('Wally Gator !', 50, 50)
            doc.text('Wally Gator is a swinging alligator in the swamp. He\'s the greatest percolator when he really starts to romp. There has never been a greater operator in the swamp. See ya later, Wally Gator.', {
                width: 410,
                align: 'left'
            })
            doc.end()
            resolve('Success')
        } catch (e) {
            reject('Error Occurred', e)
        }
    })
}

function setResponseHeaders(res, filename) {
    res.header('Content-disposition', 'inline; filename=' + filename);
    res.header('Content-type', 'application/pdf');
}

router.get('/', (req, res) => {
    res.json({'message':'up'})
})

router.get('/admin/api/', (req, res) => {
    res.json({'message':'succcess'})
})

router.post('/admin/api/product', (req, res) => {

    if(!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send('Request body is missing')
    }

    let product = {
        name: req.body.name,
        tagline: req.body.tagline,
        category: req.body.category,
        description: req.body.description,
        details: req.body.details,
        price: req.body.price,
        discount: req.body.discount,
        status: req.body.status,
        images: req.body.images
    }

    let productModelwithBody = new ProductModel(product)
    productModelwithBody.save().then(doc => {
        if(!doc || doc.length === 0) {
            return res.status(500).send(doc)
        }

        res.status(201).send(doc)
    }).catch(err => {
        res.status(500).json(err)
     })

})

router.get('/admin/api/products', (req, res) => {

    ProductModel.find().then((products) => {
        if(!products || !products.length === 0) {
            res.status(500).send(products)
        }
        res.json(products)
    }).catch((err) => {
        res.status(500).json(err)
    })

})

router.get('/admin/api/products/:id', (req, res) => {

    if(!req.params && !req.params.id) {
        return res.status(400).send('Product id is missing')
    }

    ProductModel.findOne({
        _id: req.params.id
    }).then((product) => {
        console.log('Get single product :: ', product)
        if(!product) {
            return res.status(500).json(product)
        }
        res.json(product)
    }).catch((err) => {
        res.status(500).json(err)
    })

})

router.put('/admin/api/products/:id', (req, res) => {

    if(!req.params && !req.params.id) {
        return res.status(400).send('Product id is missing')
    }

    if(!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send('Request body is missing. Nothing to update.')
    }

    let updatedProduct = {
        name: req.body.name,
        tagline: req.body.tagline,
        category: req.body.category,
        description: req.body.description,
        details: req.body.details,
        price: req.body.price,
        discount: req.body.discount,
        status: req.body.status,
        images: req.body.images
    }

    ProductModel.findOneAndUpdate({
        _id: req.params.id,
    },
        updatedProduct, {new : true}).then((product) => {
        if(!product) {
            return res.status(500).json(product)
        }
        res.json(product)
    }).catch((err) => {
        res.status(500).json(err)
    })

})

router.delete('/admin/api/products/:id', (req, res) => {

    if(!req.params && !req.params.id) {
        return res.status(400).send('Product id is missing')
    }

    ProductModel.findOneAndRemove({
        _id: req.params.id
    }).then((product) => {
        if(!product) {
            return res.status(500).json(product)
        }
        res.json(product)
    }).catch((err) => {
        res.status(500).json(err)
    })

})

router.get('/admin/api/generaterawpdf', (req, res) => {
    console.log('Hitting to genearte raw pdf route')
    let pdfFileName = 'products.pdf'
    res.setHeader('Content-disposition', 'attachment; filename=' + pdfFileName );
    res.setHeader('Content-type', 'application/pdf');
    const doc = new PDFDocument;
    doc.pipe(fs.createWriteStream(pdfFileName))
    doc.fontSize(15).text('Wally Gator !', 50, 50)
    doc.text('Wally Gator is a swinging alligator in the swamp. He\'s the greatest percolator when he really starts to romp. There has never been a greater operator in the swamp. See ya later, Wally Gator.', {
        width: 410,
        align: 'left'
    })
    doc.pipe(res)
    doc.end()

})

router.get('/admin/api/generatingPdf', (req, res) => {
    console.log('Coming in Generate PDF route ::::: ', JSON.stringify(req.query.filter))
    let filter = req.query.filter

    if(!filter) {
        return res.status(400).send('Filter is missing')
    }
    let parsedFilter = JSON.parse(filter)
    if (!parsedFilter) {
        return res.status(400).send('Filter is missing')
    } else if (!parsedFilter.where ) {
        return res.status(400).send('Where clause is missing')
    } else if (!parsedFilter.where.filename || !parsedFilter.where.minprice || !parsedFilter.where.maxprice) {
        return res.status(400).send('Required fileds are missing')
    } else {

        let filename = parsedFilter.where.filename
        let minprice = parsedFilter.where.minprice
        let maxprice = parsedFilter.where.maxprice

        console.log('filename : ', filename)
        console.log('minprice : ', minprice)
        console.log('maxprice : ', maxprice)

        ProductModel.find({
            price: {$gte: minprice, $lte: maxprice}
        }).then((products) => {
            console.log('Hitting to genearte raw pdf route')
            let pdfFileName = filename
            res.setHeader('Content-disposition', 'attachment; filename=' + pdfFileName );
            res.setHeader('Content-type', 'application/pdf');
            const doc = new PDFDocument;
            doc.pipe(fs.createWriteStream(pdfFileName))
            doc.fontSize(15).text('Wally Gator !', 50, 50)
            doc.text('Wally Gator is a swinging alligator in the swamp. He\'s the greatest percolator when he really starts to romp. There has never been a greater operator in the swamp. See ya later, Wally Gator.', {
                width: 410,
                align: 'left'
            })
            doc.text(JSON.stringify(products), {
                width: 410,
                align: 'left'
            })
            doc.pipe(res)
            doc.end()
        }).catch((err) => {
            res.status(500).json(err)
        })
    }
})

router.post('/admin/api/products/:id/images/:imageId', function (req, res) {

    console.log('Coming in updateImage Post api id : ', req.params.id)
    console.log('Coming in updateImage Post api imageId : ', req.params.imageId)

    if(!req.params && !req.params.id) {
        return res.status(400).send('Product id is missing updateImageName')
    }

    if(!req.params && !req.params.imageId) {
        return res.status(400).send('Image id is missing updateImageName')
    }

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        ProductModel.findOneAndUpdate({"_id": req.params.id, "images.imageId": req.params.imageId}, {$set: {"images.$.imageUri": req.files[0].filename}}, {new: true}).then((product) => {
            console.log('Product ::: ', product)
            if(!product) {
                return res.status(500).json(product)
            }
            return res.json(product)
        }).catch((error) => {
            return res.status(500).json(err)
        })

    })



})

module.exports = router