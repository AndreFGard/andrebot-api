import path from "path";
import http from "http"
import https from "https"
import fs from "fs";
import express, {Express, NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import cors from "cors"
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json()); //middleware that partes the request's json
app.set('view engine', 'ejs');
app.use(cors())

app.get("/", (req: Request, res: Response) => {
    res.send("eae");
});





import andrebotRoutes from "./routes/andrebot";
app.use("/andrebot", andrebotRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("not found :)");
});


//if http is enabled

if (Number(port) == 443){
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');
    
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
    
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(credentials, app);

    httpServer.listen(80, () => {
        console.log('HTTP Server running on port 80');
    });

    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
}
else {
    app.listen(port, () => {
        console.log(`starting server at http://localhost:${port}`)
     })
}