const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        // callback accepts potential errors -> null and the path where to store the file
        console.log(file);
        callback(null, './uploads/');
    },
    filename: function (req, file, callback) {
        //
        callback(null, file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        //accept the file
        callback(null, true);
    } else {
        //reject the file
        callback(null, false);

    }
};

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/', (req, res, next) => {
    Product
        .find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    console.log(doc)
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc.id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc.id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
});

router.get('/:id', (req, res, next) => {
    const productId = req.params.id;
    Product.findById(productId)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("From the database");
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products'
                    }
                });
            } else {
                res.status(404).json({ message: 'No valid entry found for provided Id' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
});

router.post('/', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Created product successfully!',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/products/" + result.id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('/:id', (req, res, next) => {
    const productId = req.params.id;
    console.log(productId);
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Product.updateOne({ _id: productId }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product updated successfully!',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products' + productId
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:id', (req, res, next) => {
    const productId = req.params.id;
    Product.remove({ _id: productId })
        .exec()
        .then(result => {
            console.log("Res ", result)
            res.status(200).json({
                message: 'Product deleted successfully!',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    body: { name: 'String', price: 'Number' }
                }
            })
        })
        .catch((err) => {
            console.log(error);
            res.status(200).json({
                error: err
            })
        });
});

module.exports = router;