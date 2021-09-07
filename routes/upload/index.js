'use strict'
var express = require('express');
var router = express.Router();
module.exports = router
const fs = require('fs')
const path = require('path')
// https://zhuanlan.zhihu.com/p/266957206
function splitDelimiter(buffer, separator) {
  const array = []
  let offset = 0;
  let index = buffer.indexOf(separator, 0)
  while (index != -1) {
    array.push(buffer.slice(offset, index))
    offset = index + separator.length
    index = buffer.indexOf(separator, index + separator.length)
  }
  array.push(buffer.slice(offset))
  
  console.log(array.length)
  return array
}

function parseHeader(header) {
  const [name, value] = header.split(': ')
  const valueObj = {}
  value.split('; ').forEach(item => {
    const [key, val = ''] = item.split('=')
    valueObj[key] = val && JSON.parse(val)
  })
  console.log(valueObj)
  return valueObj
}

function reconstruct(data, separator) {
  // 利用分隔符分割data
  // split 等同于数组的 split
  const bufArr = splitDelimiter(data, separator).slice(1, -1)
  bufArr.forEach(item => {
    // 分割 head 与 body
    const [head, body] = splitDelimiter(item, '\r\n\r\n')
    // 可能会存在两行 head，所以用换行符 '\r\n' 分割一下
    // 这里的第一个元素是截取后剩下空 buffer，所以要剔除掉
    const headArr = splitDelimiter(head, '\r\n').slice(1)
    // head 的第一行肯定是 Content-Disposition
    // 通过这个字段肯定能拿到文件名
    // 通过parseHeader解析head
    const headerVal = parseHeader(headArr[0].toString())
    // 如果 head 内存在 filename 字段，则代表是一个文件
    if (headerVal.filename) {
      console.log(headerVal.filename)

      // 写入文件到磁盘
      fs.writeFile(path.resolve(__dirname, `../public/${headerVal.filename}`), body.slice(0, -2), (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  })
}

router.get('/', function(req, res, next) {
  res.render('upload', {
    title: __filename + '@' + new Date().toISOString(),
  })
  // next()
})

// router.post('/', async function (req, res, next/**/) {
//   https_request()
//   .then((http_response)=>{
//     res.render('button', {
//           title: __filename,
//           response: http_response
//       })
//     })
//     .catch((error)=>{
//       res.render('button', {
//           title: __filename,
//           response: error
//       })
//     })
// })

router.post('/', function(request, response, next) {
  let contentLength = request.headers['content-length']
  console.log(request.headers)  
  response.setHeader('Content-Type', 'text/html');
  if (request.url === '/') {
    // 拿到请求头中的分隔符
    // 在请求体中的分隔符会多两个 --
    const separator = `--${request.headers['content-type'].split('boundary=')[1]}`
    console.log(separator)

    // 创建一个 0 字节的内存，用来存储请求体的内容
    let data = Buffer.alloc(0)
    
    // req 是一个可读流
    request.on('data', (chunk) => {
      data = Buffer.concat([data, chunk])
      response.write('<p>' + JSON.stringify({received: data.length, expected: contentLength}) + '</p>')
    })
    request.on('end', () => {
      // 解析文件
      reconstruct(data, separator)
      response.write('Well received.')
      response.end()
    })
  }
  // next()
})

router.post('/postd', function(request, response, next) {
  let contentLength = request.headers['content-length']
  console.log(request.headers)
  response.setHeader('Content-Type', 'text/html')
  if (request.url === '/postd') {
    const separator = `--${request.headers['content-type'].split('boundary=')[1]}`
    // 创建一个 0 字节的内存，用来存储请求体的内容
    let data = Buffer.alloc(0)
    
    // req 是一个可读流
    request.on('data', (chunk) => {
      data = Buffer.concat([data, chunk])
      response.write('<p>' + JSON.stringify({received: data.length, expected: contentLength}) + '</p>')
    })
    
    request.on('end', () => {
      // 解析文件
      reconstruct(data, separator)
      response.write('Well received.' + data.toString('utf-8'))
      response.end()
    })
  }
})
