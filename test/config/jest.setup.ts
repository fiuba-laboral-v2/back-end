import { CustomMatchers } from "./customMatchers";
import { Database } from "../../src/config/Database";

CustomMatchers();
Database.setConnection();
