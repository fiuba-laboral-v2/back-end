import { Request, Response } from "express";
import { OK, CREATED, INTERNAL_SERVER_ERROR } from "http-status-codes";
import RootsRepository from "./roots_repository";

const rootController = {
  findById: (req: Request, res: Response) => {
    RootsRepository
      .findById(req.params.id)
      .then(record => {
        res.status(OK).json({ data: record });
      })
      .catch(error => {
        res.status(INTERNAL_SERVER_ERROR).json({ data: error });
      });
  },
  index: (req: Request, res: Response) => {
    RootsRepository
      .findAll()
      .then(records => {
        res.status(OK).json({ data: records });
      })
      .catch(error => {
        res.status(INTERNAL_SERVER_ERROR).json({ data: error });
      });
  },
  create: (req: Request, res: Response) => {
    RootsRepository
      .create(req.body)
      .then(record => {
        res.status(CREATED).json({ data: record });
      })
      .catch(error => {
        res.status(INTERNAL_SERVER_ERROR).json({ data: error });
      });
  }
};

export default rootController;
