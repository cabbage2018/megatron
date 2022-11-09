// var express = require('express');
// var router = express.Router();

const express = require('express')
const router = express.Router()

const jsonwebtoken = require('jsonwebtoken')
const jwt = require('express-jwt')
// const db = require('../dao')
// const globalConsts = require('../common/consts')

// admin can create user and manage role, but cannot see any data & engineering material
// role: engineer can create device and settings, matrix and manage SCADA task, but cannot see other people
// role: manager can read only what admin and engineer do, receive log, trace, event and messages via email
// role: scientist can modify/see data analytics module
// role: supervisor can only create ticket for technician 
// role: technician can only process ticket according to assignment
// role: archiver can only generate report and export data
// role: demonstrator is the only one who combined all above aspects without writting anything 
// role: salesman = demonstrator
// role: projectManager is the only one who can export project settings for others
// role: commissioning can modify device and machine hardware configuration, create new model
// role: developer can create new model
// role: debugger or diagnostic can modify device related configure
// role: matenance can only do health check and generate server health report - no any data
// role: modeling can only create model
// role: connectivity can only create device and their communications parameter
// role: protocol can only add new protocol module
// role: guest can only see dashboard
// role: designer can assign each role's view and visibility, add or modify view
// role: troubleshooting can view all trace, but no previlige to modify anything
// role: guest can view webpage only
// anytime only one engineer/connectivity can login

let funcmatrix = new Map();
funcmatrix.set("admin", "people: read/write")
funcmatrix.set("engineer", "field: read/write")
funcmatrix.set("manager", "settings: read")
funcmatrix.set("scientist", "analytics: read/write")
funcmatrix.set("supervisor", "ticket: read/write")
funcmatrix.set("technician", "ticket: read; ticket_status: write")
funcmatrix.set("archiver", "data: read; report: generate/read")
funcmatrix.set("demonstrator", "data: read")
funcmatrix.set("salesman", "data: read")
funcmatrix.set("projectManager", "settings: read/write")

funcmatrix.set("commissioning", "device: read/write; model: read/write")
funcmatrix.set("developer", "model: read/write")
funcmatrix.set("debugger", "device: read/write")
funcmatrix.set("matenance", "health: read")
funcmatrix.set("modeling", "model: read/write")
funcmatrix.set("connectivity", "device: read/write")
funcmatrix.set("protocol", "protocol: read/write")
funcmatrix.set("guest", "system: read; statistics: read")
funcmatrix.set("designer", "views: read/write")
funcmatrix.set("troubleshooting", "data: read; trace: read; log: read")

router.post('/login', function (req, res, next) {
	// get username and password from req
	// check against db, password is hashed
	// if ok, generate token with user id in it, and send back to client
	// if failed, send back error to client
	const { username, password } = req.body
	db.User.findOne(
		{
			where: {
				name: username,
				password
			}
		}
	)
		.then(found => {
			const token = jsonwebtoken.sign({ id: found.id }, globalConsts.TokenKey)
			res.send({ token: token })
		})
		.catch(err => {
			logger.error(err)
			res.status(404).send('login failed, no way to proceed login')
		})
})

router.get('/info', jwt({ secret: globalConsts.TokenKey }), function (req, res, next) {
	// get user id from token
	// query name and role from db
	// send name and role back to client
	db.User.findByPk(req.user.id)
		.then(found => {
			const { name, role } = found
			res.send({ name, role })
		})
		.catch(err => {
			logger.error(err)
			res.status(404).send('not found the user info')
		})
})

router.put('/password', jwt({ secret: globalConsts.TokenKey }), function (req, res, next) {
	// get user id from token
	// ...
	const { newPassword, oldPassword } = req.body

	db.User.findByPk(req.user.id)
		.then(found => {
			if (oldPassword === found.password) {
				found.update({ password: newPassword })
					.then(_ => {
						res.send()
					})
					.catch(err => {
						logger.error(err)
						res.status(500).send('update the new password failed')
					})
			} else {
				res.status(404).send('old password not correct')
			}
		})
		.catch(err => {
			logger.error(err)
			res.status(404).send('not found the user info')
		})
})

module.exports = {
	up: (datasource) => {
		return new Promise((resolve, reject) => {
			datasource.insert(
				{
					docType: ModelName.User,
					name: 'admin',
					role: 'admin',
					password: '11111111'
				}
			), function (err, newDocs) {
				err ? reject(err) : resolve(newDocs)
			}
		})
	},

	down: (datasource) => {

	}
}

module.exports = router;

/* GET users listing. */
router.get('/', function (req, res, next) {
	res.send('respond with a resource');
});