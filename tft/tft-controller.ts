import { nextTick } from "process";

const express = require('express');
const router = express.Router();
const tftService = require('./tft-service');

router.get('/units/:server', getUnits);

module.exports = router;

interface Body {
    code?: number
    data?: object
}

export {};

function getUnits(req: any, res: any, next: any) {
    console.log('invoked getUnits');
    const server = parseInt(req.params.server);
    tftService.getUnits(server)
    .then(
        (body: Body) => {
            res.status(body.code).json(body.data);
        }
    )
    .catch((err: object) => next(err));
}