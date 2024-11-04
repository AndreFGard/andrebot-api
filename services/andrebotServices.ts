import bcrypt from "bcryptjs";
import z from 'zod';
import {AndrebotModel} from "../models/andrebotmodel"

const model = new AndrebotModel();

export interface UserEntry {
    username: string, platform: string;
};

export interface rankEntry extends UserEntry {
    wins: number;
    anon_username: string;
};

export interface Victory_Event {
    username: string,
    loser_username: string,
    word: string,
    platform: string,
    attempts: number,
    date?: string
}

const Victory_Event_Schema = z.object({
    username: z.string(),
    loser_username: z.string().optional(),
    word: z.string(),
    platform: z.string(),
    attempts: z.number(),
    date: z.string().optional()
});


export class andrebotServices {


    async getHash(password: string){
        return await bcrypt.hash(password, 10);
    }

    async auth(username: string, password: string): Promise<boolean> {
        const hashed = await model.authAdmin(username);
        
        return bcrypt.compareSync(password, hashed);
    }

    async getRank(showPlatforms: Array<string>){
        const rows = await model.getRank();

        let filtered: Array<rankEntry> = rows.map((value: rankEntry) => {
            const newname = showPlatforms.includes(value.platform) ? value.username: value.anon_username;
            value.username = newname;
            return value;
        });

        return filtered;

    }

    async addWinner(event: Victory_Event) {
        //discord, telegram are the allowed platforms, for now
        if (!['dsc', 'tg'].includes(event.platform)) {
            return 0;
        }
        await model.addWinner(event.username,event.loser_username,event.word,event.platform,event.attempts,event.date);
    }

    async addWinners(events: Array<Victory_Event>){
        for (const evt of events){
            await this.addWinner(evt);
        }
    }

    async addUser({ username, platform, wins }: { username: string, platform: string, wins?: number }) {
        model.addUser(username, platform, wins||0);
        return;
    }

    
}

