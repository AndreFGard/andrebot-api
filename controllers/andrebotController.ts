
import express, {Express, NextFunction, Request, Response} from "express";
import {andrebotServices} from "../services/andrebotServices";
const andrebotService = new andrebotServices();

export const  testauth = async (req: Request, res: Response, next: NextFunction) => {
    
    if (!await andrebotService.auth("dsc", "eae")) {
        res.send("unauthed");
    }
    else res.send("ok");
};

export const addWinners = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body.winners);
    andrebotService.addWinners(req.body.winners)

    
    res.status(200).send();
}

export const addUser = async(req: Request, res: Response, next: NextFunction) => {
    andrebotService.addUser(req.body.user).then(() => {
        res.status(200);
        console.log('ok');
    }).catch(_ => {
        res.status(500);
    });
}
