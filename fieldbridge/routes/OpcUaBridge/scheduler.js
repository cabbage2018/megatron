'use strict'
let bridge = require('./bridge')
let cron = require('node-cron')

// to minimize the downtime of this program, first circle job will initialize a second onion task, it will disappear when finished. 

let taskRoutine = cron.schedule('57 */1 * * * *', () => {

  var t1 = setTimeout(
    async () => {
      let configuration = require('./configure').load('./options.js')
      let resultsJSONObject = await bridge.scan(configuration)

    },
    3000
  )
  
})

taskRoutine.start()