import { rankEntry, UserEntry, Victory_Event, ClassSchedule, ScheduleDay } from './../services/andrebotServices';
import {Client} from "pg";
import dotenv from "dotenv";
import format from 'pg-format';
import {uniqueNamesGenerator, adjectives, colors, animals} from 'unique-names-generator';
import { error } from 'console';
import * as fs from 'fs';
dotenv.config();

const makeClient = function(errorFunc: (a: any) => void ) {
    const c = new Client({
        user: process.env.PGUSER,
        port: Number(process.env.PGPORT),
        host: process.env.PGHOST,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: {
            rejectUnauthorized: true
        }
    }).on('error', errorFunc);
    return c;
}

const coursesraw = fs.readFileSync('courses.json', 'utf-8');
const courses = JSON.parse(coursesraw) as Record<string, Record<number, ClassSchedule[]>>;
Object.values(courses).forEach(bsc => {
    Object.values(bsc).forEach(trm => {
        let i =0;
        Object.values(trm).forEach(clss => {
            clss.days.forEach(d => {
                i+=1;
                const hexcodes = ['#8cb369ff', '#f4e285ff', '#f4a259ff', '#5b8e7dff', '#bc4b51ff', '#8cb369ff', '#f4e285ff', '#f4a259ff', '#5b8e7dff', '#bc4b51ff', '#585123ff', '#eec170ff', '#f2a65aff', '#f58549ff', '#772f1aff', '#ee6055ff', '#60d394ff', '#aaf683ff', '#ffd97dff', '#ff9b85ff'];
                const color = hexcodes[Math.floor(Math.random()*Math.random()*10000*i ) % hexcodes.length];
                const range = (a: number,b: number) => Array.from(Array(b).keys()).splice(a);
                
                //this is very ugly and even imprecise, but simplifies the timetable making a lot
                const start = Number(d.start.split(":")[0]) + Math.round(Number(d.start.split(":")[1])/60);
                const end = Number(d.end.split(":")[0]) + Math.round(Number(d.end.split(":")[1])/60);
                let hours = range(start,end).map(n => (n.toString().padStart(2, '0') + ":00"));
                d.aproxHourList = hours;
                d.id = clss.id;
                d.class = clss;
                clss.colorCode = clss.colorCode || color;
            })
        })
    })
})


let ___is_db_connected = false;
export class AndrebotModel {
    client: Client;

    errorFunc(err: any){
        console.log("something bad happened");
        ___is_db_connected = false;
    }

    constructor(){

        this.client = makeClient(this.errorFunc);
        ___is_db_connected = false;
    }


    async check_connection(){
        if (!___is_db_connected) {
            try {
                this.client = makeClient(this.errorFunc);
                await this.client.connect();
                ___is_db_connected = true;
                console.log("Connected to the database");
            } catch (error) {
                console.error("Error connecting to the database:", error);
            }
            
        }
    }

    async getRank(){
        await this.check_connection();
        const res = await this.client.query("select username,anon_username,wins,platform from users order by wins desc limit 10");
        
        return res.rows;
    }

    async authAdmin(name: string): Promise<string> {
        await this.check_connection();
        const res = await this.client.query(format("select password from admins where name = %L", name));
        return res.rows[0]['password'];

    }

    createAnonUsername(username: string, platform: string) {
        return uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            length: 3}) + platform;
    }


    async addUser(username: string, platform: string, wins?: number){
        await this.check_connection();

        let q =  format("INSERT INTO users (username, platform, anon_username, wins, registration) " +
                "SELECT %L, %L, %L, %s, NOW() WHERE NOT EXISTS " +
                "(SELECT 1 FROM users WHERE username = %L AND platform = %L);",
                username, platform, this.createAnonUsername(username, platform),
                 Number(wins), username, platform);
        
        this.client.query(q)
            .catch((err: Error) => {
                console.log(err);
            })
    }


    async increment_wins(username: string, platform: string, amount: number){
        await this.check_connection();
        this.client.query(format(
            'update users set wins = wins+1 where username = %L and platform = %L',
        username, platform));
    }

    private async __do_addWinner_query(username: string, loser_username: string, word: string, platform: string, attempts: number, date?:string){
        var q1 = "insert into victories (user_id, loser_id, word, platform, attempts, event_date) " +
        "values ((SELECT id from users where username = %L and platform = %L), " + 
        "(SELECT id FROM users WHERE username = %L and platform = %L), %L, %L, %s, %L)";
        q1 = format(q1, username, platform, loser_username, platform, word,platform, attempts, date||'NOW()' );
        return this.client.query(q1);
    }


    async addWinner(username: string, loser_username: string, word: string, platform: string, attempts: number, date?:string){
        await this.check_connection();

        //TODO: propagate errors
        try {
            await this.__do_addWinner_query(username,loser_username,word,platform,attempts,date);
        } catch (err: any) {
            if (err.message.includes("null value in column")){
                console.log('unregistered user, trying to add the loser and the winner');
                try {
                    await this.addUser(username, platform, 0);
                    await this.addUser(loser_username, platform, 0);
                    await this.__do_addWinner_query(username,loser_username,word,platform,attempts,date);

                } catch (retryError: any) {
                    console.log("failed to register users: " + retryError.message||"(unknown)");
                    return;
                }
            }
        }

        try {
            await this.increment_wins(username, platform, 1);
        } catch (err: any){
            console.log("failed to increment wins");
            return;
        }
    }

    getCoursesbyBachelor(bachelor: string): Record<number, ClassSchedule[]>{
        return courses[bachelor] as Record<number, ClassSchedule[]>;
    }


}
