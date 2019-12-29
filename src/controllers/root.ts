import { Request, Response } from "express";

const httpStatus = require('http-status-codes');

class RootController {
    public index (req: Request, res: Response) {
        return res.status(httpStatus.OK).json({})
    }
}

module.exports.rootController = new RootController();