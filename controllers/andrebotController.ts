
import express, {Express, NextFunction, Request, Response} from "express";
import {andrebotServices} from "../services/andrebotServices";
const andrebotService = new andrebotServices();

export const testauth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req.headers['platform'] || req.headers['password']) ||
            !await andrebotService.auth(String(req.headers['platform']), String(req.headers['password']))) {
            res.status(403).send("unauthed");
        } else {
            res.status(200).send("ok");
        }
    } catch (err: any) {
        res.status(500).send("Database error");
    }
};


export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req.headers['platform'] || req.headers['password']) ||
            !await andrebotService.auth(String(req.headers['platform']), String(req.headers['password']))) {
            res.status(403).send("unauthed");
        } else {
            next();
        }
    } catch (err: any) {
        res.status(500).send("Database error");
    }
}

export const addWinners = async (req: Request, res: Response, next: NextFunction) => {
    andrebotService.addWinners(req.body.winners)

    res.status(200).send();
}

export const addUser = async(req: Request, res: Response, next: NextFunction) => {
    andrebotService.addUser(req.body.user).then(() => {
        res.status(200).send();
        console.log('ok');

    }).catch(_ => {
        console.log(_);
        res.status(500).send();
    });
}

export const getRank = async (req: Request, res: Response, next: NextFunction) => {
    const rank = await andrebotService.getRank(req.body.platforms || []);
    res.send({"rank": rank});
}