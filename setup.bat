%REM###npm start%

echo $JAVA_HOME
npm --version
npm install 
rem npm install -g nodemon --save
npm install -g pm2 --save
pm2 start app.js
rem pm2 stop all
rem npm start
node --version