const express = require('express');
const app = express();
const PORT = 8080;
const endpoints = ['/story', '/add', `/sub`];
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

app.get('/story', (req, res) => {
  const story = req.query.text;

  function countWords(str) {
    const arr = str.split(' ');

    return arr.filter((word) => word !== '').length;
  }
  const words = countWords(story);

  res.write(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Current Story</title>
    <link
      rel="shortcut icon"
      href="https://cdn.discordapp.com/attachments/907414829445283870/1043405131422629939/skittletrans.png"
      type="image/x-icon"
    />
    <meta content="Cuurent Story" property="og:title" />
    <meta
      content="View the current progress of the story"
      property="og:description"
    />
    <meta content="https://discord.gg/vzdGeVrxZk" property="og:url" />
    <meta content="" property="og:image" />
    <meta content="#ffffff" data-react-helmet="true" name="theme-color" />
  </head>

  <body bgcolor="#121212">
    <div id="box">
      <center>
        <h1 style="color: #ffffff; font-family: 'Montserrat', sans-serif">
          Current Story - ${words} Words
        </h1>
      </center>
      <hr
        style="
          height: 2px;
          width: 30%;
          border-width: 0;
          color: gray;
          background-color: gray;
        "
      />
      <p
        style="
          padding: 10px 70px;
          font-size: 1.2rem;
          color: #ffffff;
          font-family: 'Montserrat', sans-serif;
        "
      >
        ${story}
      </p>
    </div>

    <script src="index.js"></script>
  </body>
</html>
`);
  res.send();
});

app.listen(PORT, () => console.log(`Alive on http://localhost:${PORT}`));
