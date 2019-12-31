import { Request, Response } from "express";
import { OK } from "http-status-codes";

const rootController = {
    index: (req: Request, res: Response) => res.status(OK).json({})
};

export default rootController;
