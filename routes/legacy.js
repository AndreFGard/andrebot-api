var express = require('express');
var router = express.Router();

/* legacy functions*/
router.get('/', function(req, res, next) {
  res.send('Legacy route');
  next();
});

router.post('/winner', (req, res, next) => {
  if (!req.headers.authorization) {
      res.sendStatus(404)
      next();
  }
  if (!isAuthorization(req, res,)) {
      console.log("UNAUTHORIZED ATTEMPT: " + req.ip)
      res.status(404).send();
      next();
  }


  console.log(req.body)
  const winner = req.body;
  values = [winner.username, winner.word, winner.attempts, winner.timestamp];

  db.run(addwinner_SQL, values, function(err) {
      if (err) {
          return res.send("error: " + err);
      }
      res.send(`success`);
      });
});


router.get('/winners', async (req, res, next) => {
  if (!req.headers.authorization) {
      res.sendStatus(404)
      next();
  }
  if (!isAuthorization(req, res)) {
      console.log("UNAUTHORIZED ATTEMPT: " + req.ip)
      res.status(404).send();
      next();
  }

  
  const winners = new Map();
  await new Promise((resolve, reject) => {
      db.each("SELECT username, COUNT(username) as c FROM wordlewinners GROUP BY username;", (err, row) => {
          if (err) {
              reject(err);
          } else {
              winners.set(row.username, row.c);
          }
      }, (err, count) => {
          if (err) {
              reject(err);
          } else {
              resolve(count);
          }
      });
  });

  function logMapElements(value, key, map) {
      console.log(`m[${key}] = ${value}`);
  }
  //DBGwinners.forEach(logMapElements);
  //DBGconsole.log(winners.size)
  //DBGconst json = JSON.stringify(Object.fromEntries(winners));
  //DBGconsole.log(json);


  res.json(Object.fromEntries(winners));
});


module.exports = router;
