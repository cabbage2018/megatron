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
net start acqopcua 
net stop acqopcua
sc delete "acqopcua"

process.env.NODE_ENV need setup Windows environment varialbe NODE_ENV = development!


a:单次使用：
npm install --registry=http://registry.npmmirror.com
b:永久替换：
在开发react-native的时候，不要使用cnpm，cnpm安装的模块路径比较奇怪，packager不能正常识别。
所以，为了方便开发，我们最好是直接永久使用淘宝的镜像源
直接命令行的设置
$ npm config set registry http://registry.npmmirror.com
手动修改设置
1.打开.npmrc文件（C:\Program Files\nodejs\node_modules\npm\npmrc，没有的话可以使用git命令行建一个( touch .npmrc)，用cmd命令建会报错）
2.增加 registry =http://registry.npmmirror.com  即可。
如果需要恢复成原来的官方地址只需要执行如下命令:
npm config set registry https://registry.npmjs.org
检测是否安装成功：
npm config get registry

make conn as plugins entry, including 'daq' and 'sp'