import { Request, Response } from "express";
import { OK, CREATED, INTERNAL_SERVER_ERROR } from "http-status-codes";
import {RootsRepository} from "./roots_repository";

const rootController = {
  findById: async (req: Request, res: Response) => {
    try {
      return res.status(OK).json({ data: await RootsRepository.findById(req.params.id) });
    } catch (e) {
      return res.status(INTERNAL_SERVER_ERROR).json({ data: e });
    }
  },
  index: async (req: Request, res: Response) => {
    try {
      return res.status(OK).json({ data: await RootsRepository.findAll() });
    } catch (e) {
     return res.status(INTERNAL_SERVER_ERROR).json({ data: e });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      return res.status(CREATED).json({ data: await RootsRepository.create(req.body) });
    } catch (e) {
     return res.status(INTERNAL_SERVER_ERROR).json({ data: e });
    }
  }
};

export default rootController;
