import https from 'https';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs-extra';

import { errorMiddleware } from './error.js';
import { signCert, getRootCert } from './src/cert.js';
import { server } from "./config.js";

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// 获取根证书
app.get("/api/cert/root", async (req, res, next) => {
  try {
    const { cert } = await getRootCert();
    res.json({ code: 0, message: "success", data: { cert } });
  }
  catch (err) {
    next(err);
  }
});

// 生成证书
app.post('/api/cert/sign', async (req, res, next) => {
  try {
    const { ip } = req.body;
    const { key, cert, ca } = await signCert({ ip });
    res.json({ code: 0, message: "success", data: { key, cert, ca } });
  }
  catch (err) {
    next(err);
  }
});

app.use(errorMiddleware());

https.createServer(server.ssl, app).listen(server.port, () => {
  console.log('Server is running on port ' + server.port);
});