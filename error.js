export class CustomError extends Error {
  constructor(message) {
    super(message);
  }
}

export function errorMiddleware(option) {
  return function (err, req, res, next) {
    console.error(err.stack);

    if (err instanceof CustomError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: '内部服务器错误' });
    }
  }
}