import CORS from "cors";

export const cors = () => CORS({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  preflightContinue: true,
  exposedHeaders: [
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Accept",
    "X-Password-Expired"
  ],
  optionsSuccessStatus: 200
});
