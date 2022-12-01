const express = require('express');

const app = express();
const PORT = 8080;
const endpoints = ['/story', '/add', `/sub`, `/factorise`, `/checkWord`];
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function getData(link) {
  fetch(link)
    .then((response) => {
      if (!response.ok) {
        throw Error('ERROR');
      }
      return response.json();
    })
    .then((data) => {
      return data;
    });
}
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

app.get('/checkWord', (req, res) => {
  const word = req.query.word;
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((response) => {
      if (!response.ok) {
        throw Error('ERROR');
      }
      return response.json();
    })
    .then((data) => {
      if (data.title == 'No Definitions Found') {
        res.send({ message: 'No word found' }).sendStatus(400);
      } else {
        res.send({ message: 'Word exists', info: data }).sendStatus(200);
      }
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

app.get('/factorise', (req, res) => {
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

app.get(`/worldCup/next`, (req, res) => {
  fetch('https://worldcupjson.net/matches/today/?by_date=ASC')
    .then((response) => {
      if (!response.ok) {
        throw Error('ERROR');
      }
      return response.json();
    })
    .then((data) => {
      let output = [];
      data.forEach((element, index) => {
        data = element;

        output.push({
          id: data.id,
          venue: { stadium: data.venue, location: data.location },
          home_team: { abr: data.home_team.country, name: data.home_team.name },
          away_team: { abr: data.away_team.country, name: data.away_team.name },
          timestamp: (new Date(data.datetime).valueOf() / 1000).toFixed(0),
          time: data.datetime,
        });
      });
      res.send(output);
    });
});

app.listen(PORT, () => console.log(`Alive on http://localhost:${PORT}`));
