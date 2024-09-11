
import express, {Express, NextFunction, Request, Response} from "express";
import {andrebotServices} from "../services/andrebotServices";
const andrebotService = new andrebotServices();

export const  testauth = async (req: Request, res: Response, next: NextFunction) => {
    if ( !(req.body.platform || req.body.password) ||
        !await andrebotService.auth(req.body.platform, req.body.password)) {
            res.status(403).send("unauthed");
        }

    else res.status(200).send("ok");
};

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
