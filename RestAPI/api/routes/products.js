const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product')

router.get('/', (req, res, next) => {
    Product
        .find()
        .select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
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
        .select('name price _id')
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

router.patch('/:id', (req, res, next) => {
    const productId = req.params.id;
    console.log(productId);
    const updateOps = {};
    for(const ops of req.body){
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

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
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
                    body: {name: 'String', price: 'Number'}
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