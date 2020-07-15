import { Database } from "../../src/config/Database";

const closeConnection = () => Database.close();

export default closeConnection;
