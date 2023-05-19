
module.exports = {
	measure: function (ip, port, subnum, fc, start, quantity, ms) {
		let entry = ip + ':' + port + ':' + subnum;
		let phy = {
			fc: fc,
			register: start,
			quantity: quantity,
			timeout: ms
		}
		if (measureDic.get(entry)) {
			let arr = measureDic.get(entry);
			arr.push(phy);
			measureDic.set(entry, arr);
		} else {
			measureDic.set(entry, [phy]);
		}
	},

	tariff: function (ip, port, subnum, fc, start, quantity, ms) {
		let entry = ip + ':' + port + ':' + subnum;
		let phy = {
			fc: fc,
			register: start,
			quantity: quantity,
			timeout: ms
		}
		if (tariffDic.get(entry)) {
			let arr = tariffDic.get(entry);
			arr.push(phy);
			tariffDic.set(entry, arr);
		} else {
			tariffDic.set(entry, [phy]);
		}
	},

	schedule: function () {
	},
}
