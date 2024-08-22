FROM node:18.20.4

WORKDIR /home/app

#设置时区
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

RUN npm config set registry https://registry.npmmirror.com

# 先安装后 COPY 代码，可以利用 docker 缓存，加快构建速度
COPY package*.json ./
RUN npm install --production
RUN npm install pm2 -g

COPY . .
RUN pm2 set pm2-logrotate:max_size 10M
RUN pm2 set pm2-logrotate:compress true
RUN pm2 set pm2-logrotate:retain 5

# 容器对外暴露的端口号，要和node项目配置的端口号一致
EXPOSE 9999
# 执行启动命令
CMD ["pm2-runtime", "start", "--name", "plt-omega-ca","./bin/start.js"]
