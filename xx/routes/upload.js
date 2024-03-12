// let express = require('express');
// let router = express.Router();
// module.exports = router
var express = require('express');
var server = express.Router();
let fs = require('fs')
/* GET home page. */
server.get('/', function (req, res, next) {
	res.render('upload', { title: 'List file upload' });
	next()
});
server.post('/', function (request, response, next) {
	console.log(request.url)
	if (request.url === '/') {
		// 拿到请求头中的分隔符
		// 在请求体中的分隔符会多两个 --
		let separator = `--${request.headers['content-type'].split('boundary=')[1]}`
		// 创建一个 0 字节的内存，用来存储请求体的内容
		let data = Buffer.alloc(0)
		// req 是一个可读流
		request.on('data', (chunk) => {
			data = Buffer.concat([data, chunk])
		})
		request.on('end', () => {
			// 解析文件
			console.log(data)
			console.log(data.length)
			//fs.createWriteStream('saved.txt').pipe(data);
			fs.writeFileSync('./saved.txt', data, 'utf-8', 'b');
			response.render('upload', { title: 'File has been already uploaded' });
			//response.redirect('/')
			response.end()
			//next()
		})
	}
	//response.send('post请求成功')
})

module.exports = server;
