module.exports = {

  SENTRON3200: [
    {start: 13057, count: 99, desc: "4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library"},     //4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library
    {start: 13158, count: 10, desc: "4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library"},      //
    {start: 13569, count: 99, desc: "4.5.2 Data set DS 53: Trip log"},     //
    {start: 13670, count: 10, desc: "4.5.2 Data set DS 53: Trip log"},      //
  ],
  SENTRON4200: [
    {fc: 3, start: 1, count: 124, desc: "A.2.1 Measured variables without a time stamp with the function codes 0x03 and0x04-1"},
    {fc: 3, start: 125, count: 124, desc: "A.2.1 Measured variables without a time stamp with the function codes 0x03 and0x04-2"},
    {fc: 3, start: 249, count: 124, desc: "A.2.1 Measured variables without a time stamp with the function codes 0x03 and0x04-3"},
    {fc: 3, start: 373, count: 18, desc: "A.2.1 Measured variables without a time stamp with the function codes 0x03 and0x04-4"},
    
    {fc: 5, start: 1, count: 32, desc: "A.2.2 Structure – Digital inputs status and digital outputs status with the function codes 0x01 and 0x02"},
    {fc: 1, start: 1, count: 32, desc: "4.5.2 Data set DS 53: Trip log"},     //
    {fc: 3, start: 203, count: 2, desc: "A.2.3 Structure – Limit values with the function codes 0x01 and 0x02"},      //
    {fc: 3, start: 205, count: 2, desc: "A.2.4 Structure – PMD diagnostics and status with the function codes 0x03 and 0x04"},
    {fc: 3, start: 479, count: 64, desc: "A.2.5 Measured variables for the load profile with the function codes 0x03 and 0x04"},
    {fc: 3, start: 797, count: 64, desc: "A.2.6 Tariff-specific energy values in double format with the function codes 0x03,0x04, and 0x10"},
    {fc: 3, start: 2799, count: 32, desc: "A.2.7 Tariff-specific energy values in float format with the function codes 0x03 and0x04"},
    {fc: 3, start: 3001, end: 3571, desc: "A.2.8 Maximum values with a time stamp and the function codes 0x03 and 0x04"},
    {fc: 3, start: 6001, end: 6481, desc: "A.2.9 Minimum values with a time stamp and the function codes 0x03 and 0x04"},

    {fc: 3, start: 9001, end: 9045, desc: "A.2.10 Odd harmonics without a time stamp with the function codes 0x03 and 0x04 Fundamental voltage L1-N"},
    {fc: 3, start: 11001, end: 11045, desc: "Fundamental current L1"},
    {fc: 3, start: 22001, end: 22045, desc: "Fundamental voltage L1-L2"},

    {fc: 3, start: 12999, end: 13045, desc: "Max. 3rd harmonic voltage L1-N with time"},
    {fc: 3, start: 19001, end: 20045, desc: "Maximum fundamental current L1 with time"},

    {fc: 14, start: 36005, end: 39501, desc: "Readout of harmonic components of all harmonics with function codes 0x03,0x04 and 0x14"},
    {fc: 14, start: 30001, end: 30529, desc: "Readout of averages (aggregation) with function codes 0x03, 0x04 and 0x14"},
    {fc: 14, start: 31001, end: 31529, desc: "Readout of averages (aggregation) with function codes 0x03, 0x04 and 0x14-2"},
    
    
    {fc: 14, start: 31001, end: 31529, desc: "A.2.19 MODBUS standard device identification with the function code 0x2B"},

  ],

  SENTRON5200: [],
  SENTRON3WL: [
    {start: 13057, count: 99, desc: "4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library"},
    {start: 13158, count: 10, desc: "4.5.1 Data set DS 51: Main overview/4.5 Data sets for SENTRON WL/Data library"},
    {start: 13569, count: 99, desc: "4.5.2 Data set DS 53: Trip log"},
    {start: 13670, count: 10, desc: "4.5.2 Data set DS 53: Trip log"}
  ],
  SENTRON3VA: [],

  SIMOCODE: [],
  SIRIUS3RW55: []

};
