import { Request, Response } from "express";
import { OK, CREATED, INTERNAL_SERVER_ERROR } from "http-status-codes";
import model from "../models";

const rootController = {
  findById: (req: Request, res: Response) => {
        model.db.Root
            .find({ where: { id: req.params.id } })
            .then((root: object) => {
              res
                .status(OK)
                .json({ success: true, data: root });
          })
            .catch((error: string) => {
              res
                .status(INTERNAL_SERVER_ERROR)
                .json({ success: false, errors: error });
          });
    },
    index: (req: Request, res: Response) => {
      model.db.Root
        .findAll({})
        .then((root: object) => {
          res
            .status(OK)
            .json({ success: true, data: root });
        })
        .catch((error: string) => {
          res
            .status(INTERNAL_SERVER_ERROR)
            .json({ success: false, errors: error });
        });
    },
    create: (req: Request, res: Response) => {
        const { title } = req.body;
        model.db.Root
          .create({
              title: title
          })
          .then((root: object) => {
              res
                .status(CREATED)
                .json({ success: true, data: root });
          })
          .catch((error: string) => {
              res
                .status(INTERNAL_SERVER_ERROR)
                .json({ success: false, errors: error });
          });
    }
};

export default rootController;
