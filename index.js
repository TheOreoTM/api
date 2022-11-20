const express = require('express');
const app = express();
const PORT = 8080;
const endpoints = ['/story', '/add', `/sub`];
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

function countWords(str) {
  const arr = str.split(' ');

  return arr.filter((word) => word !== '').length;
}
app.use(express.json());

app.get('/', (req, res) => {
  res.send({
    error: 'Endpoint not found',
    endpoints: endpoints,
  });
});

app.get('/add', (req, res) => {
  const first = parseInt(req.query.num1);
  const second = parseInt(req.query.num2);
  const total = first + second;
  res.send({ output: total });
});

app.get('/sub', (req, res) => {
  const first = parseInt(req.query.num1);
  const second = parseInt(req.query.num2);
  const total = first - second;
  res.send({ output: total });
});

app.get('/factor', (req, res) => {
  const equation = req.query.equation;
  fetch(`https://newton.vercel.app/api/v2/factor/${equation}`)
    .then((response) => {
      if (!response.ok) {
        throw Error('ERROR');
      }
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      res.send({
        operation: 'factor',
        expression: data.expression,
        result: data.result,
      });
    });
});

app.listen(PORT, () => console.log(`Alive on http://localhost:${PORT}`));
