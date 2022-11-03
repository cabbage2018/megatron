'use strict'
var express = require('express');
var router = express.Router();
let path = require('path')
let fs = require('fs')
// gray-matter to read the .md files better
const matter = require('gray-matter');
// use markdown-it to convert content to HTML
var md = require("markdown-it")();
/* GET home page. */
router.get('/', function (req, res, next) {
	res.write('<p><a href="./blog">My blog</a></p>')
	res.end()
});
let dir = path.resolve('./public/blog/')

router.get("/blog", (req, res, next) => {
	console.log(dir)
	const posts = fs.readdirSync(path.join(dir, '/')).filter(file => file.endsWith('.md'));
	console.log(posts)
	res.render("blogs", {
		posts: posts
	});
});

router.get("/blog/:article", (req, res, next) => {
	const files = matter.read(dir + '/' + req.params.article + '.md');
	let content = files.content;
	var result = md.render(content);
	res.render("blog", {
		post: result,
		title: files.data.title,
		description: files.data.description,
		image: files.data.image
	});
});

/*
  MODBUSTCP
*/
router.get("/modbus", async (req, res, next) => {
	let modbus = require('../conn/daq/modbustcp');
	let physicals = []

	for (var i = 0; i < physicals.length; i++) {
		let e = res.physicals[i]
		res.resolved = []
		await modbus.acquire(
			e.ip,
			e.port,
			e.subnum,
			e.fc,
			e.reg,
			e.quantity,
			e.timeout,
			e.flash)
			.then((responses) => {
				log.mark(responses)
				let candidates = req.protocols.filter((entry) => {
					let matched = entry.protocol.toUpperCase().indexOf('MODBUSTCP') >= 0
					if (matched) {
						res.write('<p>')
						res.write(JSON.stringify(entry))
						res.write('</p>')
					}
					return matched
				})
				let physicals = [];
				candidates.forEach(e => {
					e.array.forEach(g => {
						physicals.push(g)
						res.write('<p>')
						res.write(JSON.stringify(g))
						res.write('</p>')
					})
				});

			})
			.catch((error) => {
				log.error(error)
			})
	}

})
module.exports = router