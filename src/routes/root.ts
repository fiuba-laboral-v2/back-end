import { Express, Router } from "express";
import { json } from "body-parser";
import rootController from "../controllers/root";

const RootRoute =  {
  set: (app: Express) => {
    const router = Router();
    router.get("/", rootController.index);
    router.get("/:id?", rootController.findById);
    router.post("/", json(), rootController.create);
    app.use("/", router);
  }
};

export default RootRoute;
