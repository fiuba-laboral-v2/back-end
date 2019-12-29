import { Express, Router } from "express";
import rootController from "../controllers/root";

const RootRoute =  {
  set: (app: Express) => {
    const router = Router();
    router.get("/", rootController.index);
    app.use("/", router);
  }
};

export default RootRoute;
