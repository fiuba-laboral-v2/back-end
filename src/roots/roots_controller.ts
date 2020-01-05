import { Request, Response } from "express";
import { OK, CREATED, INTERNAL_SERVER_ERROR, BAD_REQUEST } from "http-status-codes";
import { RootsRepository } from "./roots_repository";
import Roots from "./roots";

const rootController = {
  findById: async (req: Request, res: Response) => {
    try {
      return res.status(OK).json({data: await RootsRepository.findById(req.params.id)});
    } catch (exception) {
      return res.status(INTERNAL_SERVER_ERROR).json({error: "An internal error has occurred"});
    }
  },
  index: async (req: Request, res: Response) => {
    try {
      return res.status(OK).json({data: await RootsRepository.findAll()});
    } catch (exception) {
      return res.status(INTERNAL_SERVER_ERROR).json({error: "An internal error has occurred"});
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const root = new Roots(req.body);
      return res.status(CREATED).json({data: await RootsRepository.save(root)});
    } catch (exception) {
      if (exception.constructor.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({error: exception});
      } else {
        return res.status(INTERNAL_SERVER_ERROR).json({error: exception});
      }
    }
  }
};

export default rootController;
