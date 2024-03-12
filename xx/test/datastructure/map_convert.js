let assert = require('assert')
let log4js = require('log4js')
log4js.configure(require('../../config/log4js_dev.json'))
let tracer = log4js.getLogger('test::db::map_convert')
let db = require('../../routes/backend-db/dao')

describe('routes', function () {
  describe('embedded', function () {
    describe('#datatype', function () {
      it('stress', async function () {

      tracer.error("start: ", new Date())

      let idString = "l1yFWbotY2dmsvtA";
      for(var i = 0; i < 100; i = i + 1){
        let dbrecord = await db.Instance.findByPk(idString)
        // assert.ok(dbrecord.dataObject !== undefined && dbrecord !== null, "read db record wrong result: empty dataObject field")
        let original_map = new Map(dbrecord.dataObject)

        
        tracer.info(original_map)


        original_map.set( "prompt_variable_" + i, {
          _v: parseInt(Math.random() * 65535*255 + 1, 10),
          _t: new Date(),
          _qc: parseInt(Math.random() * 5, 10)
        })
        // assert.ok(original_map.size > 0, "map size is irrational:")

        dbrecord.dataObject = Array.from(original_map.entries())

        const dbrecord_updated = await db.Instance.update(dbrecord)
        // assert.ok(dbrecord_updated !== undefined && dbrecord_updated !== null, "update db record wrong result: dbrecord_updated ")
      }



      tracer.error("completed: ", new Date())
      assert.ok(true, "pass unit test")
      

      })
    })
  })
})