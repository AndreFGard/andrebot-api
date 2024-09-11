import { rankEntry, UserEntry } from './../services/andrebotServices';
import {Client} from "pg";
import dotenv from "dotenv";
import format from 'pg-format';
import {uniqueNamesGenerator, adjectives, colors, animals} from 'unique-names-generator';

dotenv.config();


export class AndrebotModel {
    is_connected: boolean;
    client: Client;

    constructor(){
        this.client = new Client({
            user: process.env.PGUSER,
            port: Number(process.env.PGPORT),
            host: process.env.PGHOST,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            ssl: {
                rejectUnauthorized: true
            }
            
        })
        this.is_connected = false;


    }

    async check_connection(){
        if (!this.is_connected) {
            try {
                await this.client.connect();
                this.is_connected = true;
                console.log("Connected to the database");
            } catch (error) {
                console.error("Error connecting to the database:", error);
            }
            
        }
    }

    async getRank(){
        await this.check_connection();
        const res = await this.client.query("select username,anon_username,wins from users limit 10");
        
        return res.rows;
    }

    async authAdmin(name: string): Promise<string> {
        await this.check_connection();
        const res = await this.client.query(format("select password from admins where name = %L", name));
        return res.rows[0]['password'];

    }

    //placeholder
    createAnonUsername(username: string, platform: string) {
        return uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            length: 3}) + platform;
    }

    async addUser(username: string, platform: string, wins?: number){
        await this.check_connection();

        let q =  format("INSERT INTO users (username, platform, anon_username, wins, registration) SELECT %L, %L, %L, %s, NOW() WHERE NOT EXISTS " +
                "(SELECT 1 FROM users WHERE username = %L AND platform = %L);",
                username, platform, this.createAnonUsername(username, platform), Number(wins), username, platform);
        
        this.client.query(q)
            .catch((err: Error) => {
                console.log(err);
            })
    }



  
}
