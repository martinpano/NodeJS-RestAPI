const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product')

router.get('/', (req, res, next) => {
    Order.find()
    .populate('product')
        .exec()
        .then(docs => {
            res.status(201).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GEt',
                            url: 'http://localhost:3000/' + doc._id
                        }
                    }
                })

            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

router.get('/:id', (req, res, next) => {
    const orderId = req.params.orderId;
    Order
        .findById(orderId)
        .select('orderId quantity productId')
        .exec()
        .then(order => {
            if (!order){
                return res.status(404).json({
                    message: 'Order not found!'
                })
            }
                res.status(201).json({
                    order: order,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders'
                    }
                });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found!'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save();
        }).then(result => {
            console.log(result);
            result.status(201).json({
                message: 'Created order successfully!',
                createdOrder: {
                    product: result.product,
                    quantity: result.quantity,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/orders/" + result._id
                    }
                }
            });
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

router.patch('/:id', (req, res, next) => {
    res.status(200).json({
        message: "Order updated",
        id: req.params.id
    });
});

router.delete('/:id', (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
        console.log("Res ", result)
        res.status(200).json({
            message: 'Order deleted successfully!',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders',
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