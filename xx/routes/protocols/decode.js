const log4js = require('log4js')
const tracer = log4js.getLogger('decode:index')

const BYTESPERPRECISION = [
	4,
	8
];

const qualityCodeArray = [
	0x80ac0000,
	0x80ab0000,
	0x80ac0000,
	0x80ad0000,
	0x80ae0000,
	0x80af0000,
	0x80b00000,
	0x80b10000,
	0x80b20000,
	0x80b30000,
	0x80b40000,
	0x80b50000
];

function tryparseFloatOrDouble(datapoint) {

	var byteoffset = datapoint.start;
	var bytelength = datapoint.counts;

	datapoint.bytes = Buffer.allocUnsafe(bytelength).fill('\0');
	var copied = -1;
	try {
		copied = datapoint.buffer.copy(datapoint.bytes, 0, byteoffset, byteoffset + bytelength);
	} catch (error) {
		tracer.info("==============tryparseFloatOrDouble FAILED=========== -$%", datapoint);
	}
	if (typeof (copied) === 'number' && copied > 0 && (copied === BYTESPERPRECISION[0] || copied === BYTESPERPRECISION[1])) {

		try {
			switch (bytelength) {

				case BYTESPERPRECISION[0]: ///float, as described in IEEE 754 STD.,
					datapoint._value = datapoint.bytes.readFloatBE(0);
					break;

				case BYTESPERPRECISION[1]: ///double
					datapoint._value = datapoint.bytes.readDoubleBE(0);
					break;

				default:
					// wrong input
					datapoint._qualityCode = qualityCodeArray[4];
					break;

			}
		} catch (error) {
			datapoint._qualityCode = qualityCodeArray[3];
		}
	}

	if (datapoint._qualityCode !== 0) {
		tracer.info("==============tryparseFloatOrDouble FAILED=========== -$%", datapoint);
	}

	return datapoint;
}


/*
  Here support as long as 'LONG' at present, 64bit, 8 bytes, 16 hex digits like '6d 3f 2e 7b f0'
  subInteger means from bit offset to bit length value
  for example, bit offset = 0 and big length =32 means whole INT data type
			   bit offset = [0::31] and bit length = 1 means one single bit position
			   one bit value can be translated into boolean like true or false(syntax with semantic)
	    
		datapoint.buffer = Buffer.from(rawdataObj.buffer);
		datapoint.start = (realStart) * / *sizeof(int) / * / 2;
		datapoint.counts = segment.registers * / * sizeof(int) / * / 2;
		datapoint.qualityCode = "0";
		datapoint.value = Number.MIN_VALUE;//NaN;
		datapoint.typeIndicator = "STRING";
 
		-->>
		datapoint.bitstart = 0..31;
		datapoint.bitcounts = 1..32;
  
  ***
  to flexibly handle any cases in work, after consideration I adopted the own way of parse INT/LONG
  that is 'shift' and 'add'
  not the original designed Buffer function (readInt32BE...) BE guess mean Big Endian
  
  now this way I can read 1 word INT from some strange device like Siemens SoftStarter
 
  at first this piece code cannot process the 2 butes INT and the above readInt32BE gave exception
  after check the tracer message on screen I found this issue was caused by Buffer's function
  so when facing bytesArray = [0x01, 0xea], this could be viewed as byte array of word
  I simply move the BE to left: please remember the left most byte owns highest order
  intValue = 0x01 << 0x8 : move the most significant byte to left, that is to implement the BE means
  intValue = 0x01 << 0x8 + 0xea: get the full length value 
 
  actually thus this piece of new code could handle any bytes array until 8 - 64bits LONG for most computer
 
*/

// Here support as long as 'INT' at present, 32bit, 4 bytes, 8 hex digits like '6d 3f 2e 7b f0'
// Here support as long as 'LONG' at present, 64bit, 8 bytes, 16 hex digits like '6d 3f 2e 7b f0'
function tryparseIntOrLong(datapoint) {

	var buffer = datapoint.buffer;
	var bytestart = datapoint.start;
	var bytecounts = datapoint.counts;

	/// lazy mode handle exception - simply I dont want any input data would cause my software crash 
	if (bytecounts > 8) {
		bytecounts = 8;
		datapoint._qualityCode = qualityCodeArray[5];
	}

	var bytebuf = new Buffer.allocUnsafe(bytecounts).fill('\0');
	var numberofcopied = buffer.copy(bytebuf, 0, bytestart, bytestart + bytecounts);
	datapoint._qualityCode = 0x0;

	/* for certain device like soft starter, the int can be only 2 bytes or one word or 16bit length?!*/
	if (typeof (numberofcopied) === 'number' /*&& (bytecounts === BYTESPERPRECISION[0] || bytecounts === BYTESPERPRECISION[1])*/) {

		var intValue = 0;///!!! how to remove this?

		for (let shift = 0; shift < bytecounts; shift = shift + 1) {
			intValue += bytebuf[shift] << (bytecounts - shift - 1);
		}

		datapoint._value = intValue;

	} else {
		datapoint._qualityCode = qualityCodeArray[6];
	}

	if (datapoint._qualityCode !== 0) {
		tracer.info("==============tryparseIntOrLong FAILED=========== -$%", datapoint);
	}

	return datapoint;
}


/* PRIVATE FUNCTION TO PARSE BITS IN INT OR LONG*/
function tryparseBitsValue(intNumber, bitoffset, bitlength) {

	/// unsigned shift
	var shiftedNumber = intNumber >>> bitoffset;
	var bitmask = 0;

	for (let i = 0; i < bitlength; i = i + 1/*, shiftedNumber >>> 1*/) {
		bitmask |= 0x1 << i;
	}

	/// cutoff MSB
	var result = shiftedNumber & bitmask;

	tracer.debug("==============tryparseBitsValue =========== -$%", result);
	return result;
}

function tryparseBoolean(datapoint) {

	var struct1 = tryparseIntOrLong(datapoint);
	var tempInt = struct1.value;

	var bitoffset = datapoint.bitstart;
	var bitlength = datapoint.bitcounts;

	/// boolean is specially transpreted bit value semantic 0=false 1=true
	if (typeof (bitlength) == 'number' && bitlength === 1) {
		var bitvalue = tryparseBitsValue(tempInt, bitoffset, bitlength);
		datapoint._value = bitvalue === 0 ? false : true;

	} else {
		datapoint._qualityCode = qualityCodeArray[6];
	}
	return datapoint;
}

function tryparseBits(datapoint) {
	var struct1 = tryparseIntOrLong(datapoint);
	var tempInt = struct1.value;
	datapoint._value = tryparseBitsValue(tempInt, datapoint.bitstart, datapoint.bitcounts);
	return datapoint;
}

/// must reveal the actual fact like circuit breaker and SIMOCODE equpment 
function tryparseTimestamp(datapoint) {
	var datapoint2 = tryparseString(datapoint);
	var timestampString = datapoint2.value;

	if (timestampString.length == datapoint.counts) {
		datapoint._value = new Date(timestampString) ///parseString(datapoint);
		/*
			var t = Date.parse(timestampString);
			if (!isNaN(t)) {  
				t = new Date(Date.parse(timestampString));  
			} else {
				t = null;  
			} 
		*/
	} else {
		datapoint._qualityCode = qualityCodeArray[10];
	}
	return datapoint;
}

/// ASCII TEXT String only no utf8 supported 
function tryparseString(datapoint) {
	var buffer = datapoint.buffer;
	var start = datapoint.start;
	var counts = datapoint.counts;
	var temp = Buffer.allocUnsafe(counts).fill('\0');
	var copied = buffer.copy(temp, 0, start, start + counts);
	datapoint._value = temp.toString('ascii', 0, temp.length);
	datapoint._bytes = temp;
	return datapoint;
}

///hex string
function tryparseHexString(datapoint) {
	var buffer = datapoint.buffer;
	var start = datapoint.start;
	var counts = datapoint.counts;

	var temp = Buffer.allocUnsafe(counts).fill('\0');
	var copied = buffer.copy(temp, 0, start, start + counts);
	datapoint._value = temp.toString('hex', 0, temp.length);
	datapoint._bytes = temp;
	return datapoint;
}

function nullcheck(datapoint) {
	const invalidated = (typeof (datapoint.start) !== 'number'
		|| typeof (datapoint.counts) !== 'number'
		|| typeof (datapoint.buffer) !== 'object'
		// || typeof(datapoint.VarType) !== 'object'
		|| datapoint.buffer.length <= 0
		// || typeof (datapoint.position) !== 'number'
		// || typeof (datapoint.registers) !== 'number'
	);

	if (invalidated) {
		tracer.info("typeof (datapoint.start) !== 'number' check failed!", validated, __filename);
		throw (__filename + __dirname + ' terminated ');
	}
}

///worst of all mindsphere only defined double/int/boolean/string/timestamp and no long and float at all
function makesinglepoint(datapoint) {

	nullcheck(datapoint)

	datapoint._qualityCode = 0x0
	switch (datapoint.VarType.toUpperCase()) {

		case "FLOAT":
			datapoint = tryparseFloatOrDouble(datapoint);
			break;

		case "DOUBLE":
			datapoint = tryparseFloatOrDouble(datapoint);
			break;

		case "INT":
			datapoint = tryparseIntOrLong(datapoint);
			break;

		case "LONG":
			datapoint = tryparseIntOrLong(datapoint);
			break;

		case "BOOLEAN":
			datapoint = tryparseBoolean(datapoint);
			break;

		case "BITS":
			datapoint = tryparseBits(datapoint);
			break;

		case "TIMESTAMP":
			datapoint = tryparseTimestamp(datapoint);/// rather than from an UTC readable string some time it is an int#, oh bad
			break;

		case "STRING":
			datapoint = tryparseString(datapoint);
			break;

		case "HEXSTRING":
			datapoint = tryparseHexString(datapoint);
			break;

		default:
			datapoint = tryparseString(datapoint);
			datapoint._qualityCode = 0x81234abcd;
			break;
	}

	datapoint.buffer = undefined;
	return datapoint;
}

/**
{
	"GatewaySerialNumber": "a1EXPsAfA8Z",
	"machineId": "2f13442ede974c4b8694c72173e1e8cd",
	"Model": "SIMOCODEPROVPN",
	"timeseries": [
		{
			"_t": "2019-02-10T23:00:00Z",
			"_v": true,
			"_n": "Van",
			"_qc": "0",
			"_id": "E17"
		},
		{
			"_t": "2019-02-14T23:01:00Z",
			"_v": false,
			"_n": "Vbn",
			"_qc": "0X80000000",
			"_id": "enginetemperatureValue2"
		}
	]
}
	**/

function forge(complexObject, displayCallback) {

	// register === 16bits word
	const BytesPerRegister = 2;
	const rawdataObj = complexObject.resp;
	const modelObj = complexObject.decoder;

	if (rawdataObj === null || rawdataObj === undefined || modelObj === null || modelObj === undefined) {
		tracer.error("error: rawdataObj === null || rawdataObj === undefined || modelObj === null || modelObj === undefined")
		return null;
	}

	var rawdataObjStart = -1
	var rawdataObjCount = -1
	try {
		rawdataObjStart = Number(rawdataObj.request._body._start)
		rawdataObjCount = Number(rawdataObj.request._body._count)
	} catch (error) {
		tracer.error(error)
		return null;
	}

	if (rawdataObjStart < 0 || rawdataObjCount < 0) {
		tracer.error("rawdataObjStart < 0 || rawdataObjCount < 0")
		return null;
	}
	var tempbuffer = Buffer.from(rawdataObj.response._body._valuesAsBuffer);

	if (modelObj.dataPoints.length > 0) {


		var outer = {};
		outer.agentTime = new Date().toISOString()
		outer.GatewaySerialNumber = complexObject.GatewaySerialNumber
		outer.machineId = complexObject.name || "UNKNOWN"
		outer.Model = modelObj.machineModel || "UNKNOWNMODEL"
		outer.timeseries = [];

		// machine model seems correct
		for (let i = 0; i < modelObj.dataPoints.length; i += 1) {
			const segment = modelObj.dataPoints[i]

			// try to hit the decoding address and type in raw response
			var realStart = Number(segment.dataPointData.address) - (rawdataObjStart);

			// now count align with bytes instead of registers
			segment.start = (realStart) * BytesPerRegister;// actually this is real offset in register layout
			segment.counts = Number(segment.dataPointData.quantity) * BytesPerRegister;
			segment.VarType = segment.dataType;
			segment.buffer = tempbuffer;
			const booleanBoundaryCheck = segment.start + segment.counts <= segment.buffer.length /* / 2 */ ? true : false;

			if (
				realStart >= 0
				&& booleanBoundaryCheck
				// && rawdataObj.response !== undefined
				// && modelObj.machineModel !== undefined
			) {
				var Obj1 = makesinglepoint(segment);
				var transient = {}
				transient._t = rawdataObj.metrics.receivedAt
				transient._v = Obj1._value
				transient._n = segment.name
				transient._qc = Obj1._qualityCode
				transient._id = segment.dataPointId
				outer.timeseries.push(transient)

				// dump to website page's/or trace log file with readable format
				const indexKeyString = "/" + outer.machineId + "/" + transient._n + "/"
				tracer.info(indexKeyString, transient)
			}
		}
		if (outer.timeseries.length > 0) {

			// for efficiency consideration~
			displayCallback(outer.machineId, outer.timeseries)
			return outer;
		}
	}
	return null;
}

/*
model                                  |
address                                |---> decoding
response                               |
*/
module.exports.forge = forge

// finally leave filelead, abandon using it as model name!
const filelead = entry[0].split('.')[0]
const fullpath = entry[1]
const modelObject = JSON.parse(fs.readFileSync(fullpath, "utf8"))

