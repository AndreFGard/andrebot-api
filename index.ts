import path from "path";
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



app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), { dotfiles: 'allow' }));

import andrebotRoutes from "./routes/andrebot";
app.use("/andrebot", andrebotRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send("not found :)");
});

app.listen(port, () => {
    console.log(`starting server at http://localhost:${port}`)
})