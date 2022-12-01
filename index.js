const express = require('express');

const app = express();
const PORT = 8080;
const endpoints = ['/story', '/add', `/sub`, `/factorise`, `/checkWord`];
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

function convertDateToEpoch(date) {
  return (new Date(date).valueOf() / 1000).toFixed(0);
}

const getJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok)
    // check if response worked (no 404 errors etc...)
    throw new Error(response.statusText);

  const data = response.json(); // get JSON from the response
  return data; // returns a promise, which resolves to this data value
};

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

app.get(`/worldcup/next`, (req, res) => {
  fetch('https://worldcupjson.net/matches/today/?by_date=ASC')
    .then((response) => {
      if (!response.ok) {
        throw Error('ERROR');
      }
      return response.json();
    })
    .then((data) => {
      // Getting by id
      let output = [];
      data.forEach((element) => {
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

app.get('/worldcup/find/:id', (req, res) => {
  const id = req.params.id;
  let matchData;
  fetch(`https://worldcupjson.net/matches?details=true`)
    .then((response) => {
      if (!response.ok) {
        throw Error('ERROR');
      }
      return response.json();
    })
    .then((data) => {
      // worldcup.json
      const matchIndex = data.findIndex((match) => match.id == id);
      matchData = data[matchIndex];
      let matchTime = convertDateToEpoch(data[matchIndex].datetime);

      //espn
      let ESPNData;
      getJSON(
        'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=950&dates=20221001-20230130'
      )
        .then((data) => {
          // Stuff goes below here
          let ESPNIndex = data.events.findIndex(
            (match) => convertDateToEpoch(match.date) === matchTime
          );
          // Delete useless data
          ESPNData = data.events[ESPNIndex];
          delete ESPNData.links;
          delete ESPNData.season;
          delete ESPNData.uid;
          delete ESPNData.date;
          ESPNData.competitors = ESPNData.competitions[0].competitors;
          delete ESPNData.competitions;
          delete matchData.home_team_statistics;
          delete matchData.away_team_statistics;
          matchData.home_team_statistics = ESPNData.competitors[0].statistics;
          matchData.away_team_statistics = ESPNData.competitors[1].statistics;
          matchData.home_team.logo = ESPNData.competitors[0].team.logo;
          matchData.away_team.logo = ESPNData.competitors[1].team.logo;
          matchData.home_team.color = [
            ESPNData.competitors[0].team.color,
            ESPNData.competitors[0].team.alternateColor,
          ];
          matchData.away_team.color = [
            ESPNData.competitors[1].team.color,
            ESPNData.competitors[1].team.alternateColor,
          ];
          matchData.name = ESPNData.name;
          matchData.espnId = ESPNData.id;
          delete matchData.officials;
          delete matchData.detailedTime;
          matchData.detailedTime = ESPNData.status;
          matchData.timestamp = convertDateToEpoch(matchData.datetime);

          res.send(matchData);
        })
        .catch((error) => {
          console.error(error);
        });
    });
});
app.listen(PORT, () => console.log(`Alive on http://localhost:${PORT}`));

// app.get('/test', (req, res) => {
//   console.log('Fetching data...');
//   getJSON(
//     'https://soundcloud.com/oembed?url=http%3A//soundcloud.com/forss/flickermood&format=json'
//   )
//     .then((data) => {
//       // Stuff goes below here
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// });
