import https from 'https';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { errorMiddleware } from './error.js';
import { signCert, getRootCert } from './cert.js';
import { server } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.json());

// 获取根证书
app.get('/api/cert/root', async (req, res, next) => {
  try {
    const { cert } = await getRootCert();
    res.json({ code: 0, message: 'success', data: { cert } });
  } catch (err) {
    next(err);
  }
});

// 生成证书
app.post('/api/cert/sign', async (req, res, next) => {
  try {
    const { ip } = req.body;
    const { key, cert, ca } = await signCert({ ip });
    res.json({ code: 0, message: 'success', data: { key, cert, ca } });
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware());

https.createServer(server.ssl, app).listen(
  {
    host: server.host,
    port: server.port,
  },
  () => {
    console.log(
      `请访问 https://${server.host === '0.0.0.0' ? '127.0.0.1' : server.host}:${server.port}`,
    );
  },
);
