express --ejs website
cd website
npm install
SET DEBUG=fieldbridge * & npm start
SET DEBUG=fieldbridge * & npm start

npm install -g pkg
npm install pkg --save-dev
pkg -t win app.js --out-path=dist/
pkg ./package.json  ##must run in corporate intranet

//register as a service on Windows
sc create acqopcua binpath= D:\Siemens\mac_pkg\acq.exe type= own start= auto displayname= acq(opcua) 
sc description acqopcua "Creates and manages OPCUA IEC62541 data bridge/broker server for specific project user."
net start acqopcua 
net stop acqopcua
sc delete "acqopcua"

process.env.NODE_ENV need setup Windows environment varialbe NODE_ENV = development!
