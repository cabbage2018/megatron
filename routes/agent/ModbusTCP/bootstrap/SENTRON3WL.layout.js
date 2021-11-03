module.exports = {
  channel: "modbustcp",
  repeatIntervalMs: 600000,
  protocolData: {
      ip: "192.168.2.135",
      port: 502,
      subordinatorNumber: 127,
      timeoutMs: 6000,
      functionType: 3
  },

  modelsMatrix: [
      {plmn: "MODBUS_DEVICE", id_fc: 3, id_start: 1003, id_count: 100, big_endian: true},
      {plmn: "IED1", id_fc: 3, id_start: 1003, id_count: 100, big_endian: true},
      {plmn: "Protect", id_fc: 3, id_start: 1003, id_count: 100, big_endian: true},
  ],
  
  physicalAddress: {
      start: 23309,
      count:100,
      registerGrid: [
          // COUNT MUST LESS THAN 100 STABILITY
          {start: 13057, count: 99, desc: "4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library"},     //4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library
          {start: 13158, count: 10, desc: "4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library"},      //
          {start: 13569, count: 99, desc: "4.5.2 Data set DS 53: Trip log"},     //
          {start: 13670, count: 10, desc: "4.5.2 Data set DS 53: Trip log"},      //
          {start: 13825, count: 99, desc: "4.5.3 Data set DS 54: Event log"},     //
          {start: 13926, count: 19, desc: "4.5.3 Data set DS 54: Event log"},      //
          {start: 17409, count: 22, desc: "4.5.5 Data set DS 68: Data of the CubicleBUS module"},      //
          {start: 17665, count: 21, desc: "4.5.6 Data set DS 69: Status of the modules"},      //
          {start: 19713, count: 28, desc: "4.5.11 Data set DS 77: Min./max. measured values of the temperaturesy"},      //
          {start: 23297, count: 41, desc: "4.5.12 Data set DS 91: Statistical information"},      //
          {start: 23553, count: 96, desc: "4.5.13 Data set DS 92: Diagnostic data"},      //4.5.13 Data set DS 92: Diagnostic data
          {start: 24833, count: 99, desc: "4.5.16 Data set DS 97: Detailed identification"},     //4.5.16 Data set DS 97: Detailed identification
          {start: 24934, count: 10, desc: "4.5.16 Data set DS 97: Detailed identification"},      //4.5.16 Data set DS 97: Detailed identification
          {start: 25601, count: 49, desc: "4.5.17 Data set DS 100: Identification overview"},      //4.5.17 Data set DS 100: Identification overview
          {start: 33025, count: 15, desc: "4.5.19 Data set DS 129: Parameters of the protection function and settings for load shedding and load pickup"},      //4.5.19 Data set DS 129: Parameters of the protection function and settings for load shedding and load pickup
          {start: 40961, count: 38, desc: "4.5.22 Data set DS 160: Parameters for communication"},      //4.5.22 Data set DS 160: Parameters for communication
          {start: 41217, count: 81, desc: "4.5.23 Data set DS 161: Parameters for communication in which the parameters for reading out and setting the communication "},      //4.5.23 Data set DS 161: Parameters for communication in which the parameters for reading out and setting the communication of the COM35 are stored
          {start: 41473, count: 37, desc: "4.5.24 Data set DS 162: Device configuration"},      //4.5.24 Data set DS 162: Device configuration
          {start: 41729, count: 23, desc: "4.5.25 Data set DS 163: Profinet device name"},      //4.5.25 Data set DS 163: Profinet device name
          {start: 42241, count: 96, desc: "4.5.26 Data set DS 165: Identification comment"},      //4.5.26 Data set DS 165: Identification comment
      ],
  }
}
