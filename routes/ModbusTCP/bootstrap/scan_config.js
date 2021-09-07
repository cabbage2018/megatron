module.exports = {
    channel: "modbustcp",
    repeatIntervalMs: 6000,
    protocolData: {
        ip: "192.168.2.135",
        port: 502,
        subordinatorNumber: 127,
        timeoutMs: 3000,
        functionType: 3
    },

    physicalAddress: {
        start: 23309,
        count: 100,
        registerGrid: [
            // COUNT MUST LESS THAN 100 FOR SAFETY
            {start: 13056, count: 119, desc: "4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library"},     //4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library
            //{start: 13157, count: 10, desc: "4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library"},      //
            {start: 13568, count: 121, desc: "4.5.2 Data set DS 53: Trip log"},     //
            //{start: 13670, count: 10, desc: "4.5.2 Data set DS 53: Trip log"},      //
            {start: 13824, count: 121, desc: "4.5.3 Data set DS 54: Event log"},     //
            {start: 16384, count: 66, desc: "4.5.3 Data set DS 54: Event log"},      //
            {start: 17408, count: 23, desc: "4.5.5 Data set DS 68: Data of the CubicleBUS module"},      //
            {start: 17664, count: 22, desc: "4.5.6 Data set DS 69: Status of the modules"},      //
            {start: 18432, count: 118, desc: "4.5.11 Data set DS 77: Min./max. measured values of the temperaturesy"},      //
            {start: 18688, count: 87, desc: "4.5.11 Data set DS 77: Min./max. measured values of the temperaturesy"},      //
            {start: 18944, count: 68, desc: "4.5.11 Data set DS 77: Min./max. measured values of the temperaturesy"},      //
            {start: 19456, count: 46, desc: "4.5.11 Data set DS 77: Min./max. measured values of the temperaturesy"},      //
            {start: 19712, count: 29, desc: "4.5.11 Data set DS 77: Min./max. measured values of the temperaturesy"},      //
            {start: 23296, count: 42, desc: "4.5.12 Data set DS 91: Statistical information"},      //
            {start: 23552, count: 97, desc: "4.5.13 Data set DS 92: Diagnostic data"},      //4.5.13 Data set DS 92: Diagnostic data
            {start: 24064, count: 99, desc: "4.5.16 Data set DS 97: Detailed identification"},     //4.5.16 Data set DS 97: Detailed identification
            {start: 24832, count: 112, desc: "4.5.16 Data set DS 97: Detailed identification"},     //4.5.16 Data set DS 97: Detailed identification
            {start: 25600, count: 50, desc: "4.5.17 Data set DS 100: Identification overview"},      //4.5.17 Data set DS 100: Identification overview
            {start: 32768, count: 52, desc: "4.5.16 Data set DS 97: Detailed identification"},      //4.5.16 Data set DS 97: Detailed identification
            {start: 33024, count: 69, desc: "4.5.19 Data set DS 129: Parameters of the protection function and settings for load shedding and load pickup"},      //4.5.19 Data set DS 129: Parameters of the protection function and settings for load shedding and load pickup
            {start: 33280, count: 74, desc: "4.5.19 Data set DS 129: Parameters of the protection function and settings for load shedding and load pickup"},      //4.5.19 Data set DS 129: Parameters of the protection function and settings for load shedding and load pickup
            {start: 33536, count: 35, desc: "4.5.19 Data set DS 129: Parameters of the protection function and settings for load shedding and load pickup"},      //4.5.19 Data set DS 129: Parameters of the protection function and settings for load shedding and load pickup
            {start: 40960, count: 39, desc: "4.5.22 Data set DS 160: Parameters for communication"},      //4.5.22 Data set DS 160: Parameters for communication
            {start: 41216, count: 82, desc: "4.5.23 Data set DS 161: Parameters for communication in which the parameters for reading out and setting the communication "},      //4.5.23 Data set DS 161: Parameters for communication in which the parameters for reading out and setting the communication of the COM35 are stored
            {start: 41472, count: 38, desc: "4.5.24 Data set DS 162: Device configuration"},      //4.5.24 Data set DS 162: Device configuration
            {start: 41728, count: 122, desc: "4.5.25 Data set DS 163: Profinet device name"},      //4.5.25 Data set DS 163: Profinet device name
			{start: 42496, count: 104, desc: "4.5.24 Data set DS 42497"},      //
			{start: 42240, count: 97, desc: "4.5.24 Data set DS 42240"}      //

            // {start: 42752, count: 47, desc: "4.5.26 Data set DS 165: Identification comment"},      //4.5.26 Data set DS 165: Identification comment

        ],
    }
}
