module.exports = {
  url: "127.0.0.1:1883",
  con_options: {
    qos: 2,
    keepalive: 320,
    will: {
      topic: "/local/test/",
      payload: `the local!? broker/client disconnect badly@ ${new Date()}.`,
      qos: 2,
      retain: true,
      properties: {
          willDelayInterval: 60000,
          payloadFormatIndicator: true,
          messageExpiryInterval: 7 * 24 * 60 * 60, 
          contentType: "string",
      }
    }
  }
}