'use strict'
let Routers = require('express-promise-router')
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
let router = new Routers()

// export our router to be mounted by the parent application
// seems have to be the last line in the file
module.exports = router

let log4js = require('log4js')
let log = log4js.getLogger('routes::daq')

router.get('/channel', (req, res) => {
	tracer.debug(req.params)
	var idString = req.params.id


	let map = new Map()
	const files = fs.readdirSync(path.join(process.cwd(), './routes/daq/')).filter(item => !fs.statSync(path.join(path.join(process.cwd(), './routes/daq/'), item)).isDirectory())
	files.forEach((item, index) => {
		map.set(item, index)
	})
	res.render('dictionary', {
		title: __filename + new Date().toISOString(),
		items: map
	})
})


let matrix = new Map()
if (arrayOfList !== null && arrayOfList !== undefined) {
	matrix = new Map(arrayOfList)
}
// tracer.debug(JSON.stringify([...matrix]))
