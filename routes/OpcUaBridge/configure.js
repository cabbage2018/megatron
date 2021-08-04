'use strict'
const { fs } = require("fs")
module.exports = {
  load: function (filepath) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
  },
}