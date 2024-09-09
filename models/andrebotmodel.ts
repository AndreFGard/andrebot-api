import { rankEntry, UserEntry } from './../services/andrebotServices';
import {Client} from "pg";
import dotenv from "dotenv";
import format from 'pg-format';

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

}
