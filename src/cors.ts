import CORS from "cors";

export const cors = () => CORS({
  origin: "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
});
