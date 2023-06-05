#Dockerfile

# use docker node 10
FROM node:8

# create a directory to run docker
WORKDIR /app

# copy package.json into the new directory
COPY package.json /app

# install the dependencies
RUN npm install

# copy all other files and folder into the app directory
COPY . /app

# open port 3000
EXPOSE 3000


# run the server
CMD pm2 start bin/www

###要构建 docker 应用，请在终端中键入以下命
###docker build -t docker-node-app .

###运行 docker 应用：
###docker run -it -p 5000:3000 docker-node-app


###查看所有正在运行的 docker 程序，请在终端中使用以下命令
###docker ps

###用 docker 创建了你的第一个部署
###快速迭代的系统中， docker 是很重要。因此我们需要学习它。我们使用的大多数代码都在 docker hub 上找到。像 Microsoft、mongoDB、PHP 等许多公司已经为这些事情制作了代码（或镜像），因此你需要做的就是制作自己的副本。这些配置称为镜像。例如可以在这里找到我们所使用的 node 镜像。

