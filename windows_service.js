var Service = require('node-windows').Service;
var EventLogger = require('node-windows').EventLogger;
 
var log = new EventLogger('Hello World');
 
log.warn('Watch out!');
log.error('Something went wrong.');

// Create a new service object
var svc = new Service({
  name:'acq_opcua',
  description: 'A example service fabricated by Node.js and node-windows module to enable a data acquisition routine from seconds to hours on Windows server2012R2.',
  script: require('path').join(process.cwd(),'./routes/index.js'),
  //, allowServiceLogon: true   
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
  //, workingDirectory: '...'
  //, allowServiceLogon: true
});
 
// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  log.info('script is installed...');

  svc.start();
});
 
// svc.install();

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  log.warn('Uninstall complete.');
  log.info('The service exists: ',svc.exists);
});
 
// Uninstall the service.
svc.uninstall();