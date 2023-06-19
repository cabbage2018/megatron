'use strict'
let Routers = require('express-promise-router')
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
let router = new Routers()

// export our router to be mounted by the parent application
// seems have to be the last line in the file
module.exports = router

const controller = require('./controller').Protocol;

/* GET home page. */
router.get('/', function (req, res, next) {
    controller.list(req, res)
});

router.get('/:id', function (req, res, next) {
    controller.retrieve(req, res)
});

router.post('/', function (req, res, next) {
    controller.create(req, res)
});

router.delete('/:id', function (req, res, next) {
    controller.destroy(req, res)
});

router.put('/:id', function (req, res, next) {
    controller.update(req, res)
});