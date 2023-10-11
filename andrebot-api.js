const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();


// if no env var specifying the database location
const dbpath = (process.env.DBPATH ? process.env.DBPATH : '/run/user/1001/');
//const passhash = process.env.PASSWORDHASH;
const passhash = "$2b$10$kErNPP96nI7VuJzMaINcuOksyn5sHkwlQgv/SMYsYbMA0qDcLbfmG"
const port = process.env.PORT || 30700

//CREATE TABLE wordlewinners (username varchar(50) NOT NULL, word varchar(20), attempts int, timestamp DATE);
const addwinner_SQL = `INSERT INTO wordlewinners (username, word, attempts, timestamp) VALUES (?, ?, ?, ?);`


let db = new sqlite3.Database(dbpath + 'andrebot.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('DB CONNECTED')
});

app.get("/", (req, res) =>{
    res.send("hello")
})

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



const { Deta } = require('deta'); // import Deta
const deta = new Deta()
const detadb = deta.Base("andrebot-apidb")

async function incrementAtt(detadb=detadb, key, attribute, value) {
    const response = await detadb.get(key)
    return await detadb.update({[attribute]: (response[attribute ]+ value)}, key)
}

async function appendAtt(detadb=detadb, key, attribute, value) {
    const response = await detadb.get(key)
    let arraytosend = response[attribute]
    arraytosend.push(value)
    return await detadb.update({[attribute]: (arraytosend)}, key)
}



app.post('/testdeta', async (req, res) => {
    const winner = req.body;
    values = [winner.username, winner.word, winner.attempts, winner.timestamp];

    console.log('awaiting...')
    const stat = await detadb.put({"word": winner.word, "attempts": 0, "times": [2, 3]}, winner.username)
    
    
    const test = await detadb.util.increment("2", "elo")
    const test2 = await detadb.util.increment({"attempts": 1}, "elo")
    //const a = await detadb.update(test2, "elo")
    
    console.log(test2)
    console.log("\\\\\ item")
    const itemm = await detadb.get(winner.username)
    console.log(itemm)




    res.sendStatus(200)
})



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

app.post('/winnerdeta', (req, res) => {
    if (!req.headers.authorization) {
        res.sendStatus(404)
        return;
    }
    if (!isAuthorization(req, res)) {
        console.log("UNAUTHORIZED ATTEMPT: " + req.ip)
        res.status(404).send();
        return;
    }


    console.log("AUTHORIZED")
    console.log(req.body)
    const winner = req.body;
    values = [winner.username, winner.word, winner.attempts, winner.timestamp];

    detadb.put({"username": winner.username, "word": winner.word, "attempts": winner.attempts}, ("23" + winner.timestamp.toString()))
    res.sendStatus(200)

});

app.get('/winnersdeta', async (req, res) => {
    if (!req.headers.authorization) {
        res.sendStatus(404)
        return;
    }
    if (!isAuthorization(req, res)) {
        console.log("UNAUTHORIZED ATTEMPT: " + req.ip)
        res.status(404).send();
        return;
    }

    console.log("AUTHORIZED ")

    let fetchedItems = await detadb.fetch({"key?pfx": "23"});
    let allItems = fetchedItems.items;
    const winnersdeta = new Map();
    allItems.forEach(element => {
        //DBGconsole.log("e: " + JSON.stringify(element.key))
        if (winnersdeta.has(element.username)) {
            winnersdeta.set(element.username, (winnersdeta.get(element.username) + 1))
            //DBGconsole.log(`${element.username} being UPPED`)
        }
        else {
            //DBGconsole.log(`${element.username} NEW `)
            winnersdeta.set(element.username, 1)
        }
    });


    function logMapElements(value, key, map) {
        //DBGconsole.log(`m[${key}] = ${value}`);
    }
    //DBGwinnersdeta.forEach(logMapElements);
    //DBGconsole.log(winnersdeta.size)
    //DBGconst json = JSON.stringify(Object.fromEntries(winnersdeta));
    //DBGconsole.log(json);
    

    res.json(Object.fromEntries(winnersdeta));
});



app.get('/pa', async (req, res) => {
    detadb.update({"attempts": detadb.util.increment()}, "23101010")
    res.sendStatus(200)
 
});




app.listen(port, () => console.log(`app listening on port ${port}!\n dbpath: ${dbpath}`));
