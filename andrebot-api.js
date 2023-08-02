const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();


// if no env var specifying the database location
const dbpath = (process.env.DBPATH ? process.env.DBPATH : '/run/user/1001/');
const passhash = process.env.PASSWORDHASH;
const port = 30700;

//CREATE TABLE wordlewinners (username varchar(50) NOT NULL, word varchar(20), attempts int, timestamp DATE);
const addwinner_SQL = `INSERT INTO wordlewinners (username, word, attempts, timestamp) VALUES (?, ?, ?, ?);`


let db = new sqlite3.Database(dbpath + 'andrebot.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('DB CONNECTED')
});

app.get("/testconnection", (req, res) => {
    res.send("you: " + req.ip)
})

app.use(cors());
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//authenticator
isAuthorization = function (req, res) {
    let resultado = false;
    return bcrypt.compareSync(req.headers.authorization, passhash);

}

app.get("/testauthorizationandapikey", (req, res) => {
    if (!req.headers.authorization) {
        res.status(403).send("Missing something...")
        return;
    }
    if (!isAuthorization(req, res)) {
        console.log("UNAUTHORIZED ATTEMPT: " + req.ip)
        res.status(403).send("Failed")
        return;
    }
    else {
        res.status(200).send("OK to " + req.ip)
        return
    }
    
})

app.post('/winner', (req, res) => {
    if (!req.headers.authorization) {
        res.sendStatus(404)
        return;
    }
    if (!isAuthorization(req, res)) {
        console.log("UNAUTHORIZED ATTEMPT: " + req.ip)
        res.status(404).send();
        return;
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


app.get('/winners', async (req, res) => {
    if (!req.headers.authorization) {
        res.sendStatus(404)
        return;
    }
    if (!isAuthorization(req, res)) {
        console.log("UNAUTHORIZED ATTEMPT: " + req.ip)
        res.status(404).send();
        return;
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


app.listen(port, () => console.log(`app listening on port ${port}!\n dbpath: ${dbpath}`));
