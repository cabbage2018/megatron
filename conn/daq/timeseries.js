module.exports = {
    samples:
    [
        {
            machineId: "SEAL_EPC_FACTORY_#100_33",
            model: "SIMOCODEPROVPN",
            timeseries:[
                {
                    _t: new Date(),
                    _v: Math.random() * 100,
                    _q: 0x0,
                    _i: "TARIFFIMPORTACTIVEPOWER2"
                },
                {
                    _t: new Date(),
                    _v: Math.random() * 2,
                    _q: 0x0,
                    _i: "TRIPSTATUS1"
                }
            ]
        },
        {
            machineId: "SEAL_EPC_CCEAD_#100_44",
            model: "SENTRON3WL",
            timeseries:[
                {
                    _t: new Date(),
                    _v: Math.random() * 1000,
                    _q: 0x0,
                    _i: "TARIFFIMPORTACTIVEPOWER2"
                },
                {
                    _t: new Date(),
                    _v: Math.random() * 2,
                    _q: 0x0,
                    _i: "TRIPSTATUS1"
                }
            ]
        }
    ],
    samples_enhanced:
    {        
        GatewaySerialNumber: "a1EXPsAfA8Z",
        array:
        [
            {
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
            },
            {
                "machineId ": "000357a3ef0840a89703163a1c97a40a",
                "Model": "SENTRON3WL",
                "timeseries": [
                    {
                        "_t": "2019-02-11T23:00:00Z",
                        "_v": "382.9",
                        "_n": "Vcn",
                        "_qc": "0x0000",
                        "_id": "carmanualValue"
                    }
                ]
            },
            {
                "machineId": "0157784093b640d8a02f16ca6daf8287",
                "machineModel": "SENTRON3VA2",
                "timeseries": [
                    {
                        "_t": "2019-02-12T23:00:00Z",
                        "_v": "654.4",
                        "_n": "Ca",
                        "_qc": "0X80020000",
                        "_id ": "speedValue"
                    }
                ]
            }
        ]
    },
    samples_condensed:
    {        
        GatewaySerialNumber: "a1EXPsAfA8Z",
        samples:
        {
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
        },
    }
}
;
