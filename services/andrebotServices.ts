import bcrypt from "bcryptjs";
import {AndrebotModel} from "../models/andrebotmodel"

const model = new AndrebotModel();

export interface UserEntry {
    username: string, platform: string;
};

export interface rankEntry extends UserEntry {
    wins: number;
    anon_username: string;
};


export class andrebotServices {

    testauth(): boolean {
        return true;
    }

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
            const newname = value.platform in showPlatforms ? value.username: value.anon_username;
            value.username = newname;
            return value;
        });

        return filtered;

    }

}

