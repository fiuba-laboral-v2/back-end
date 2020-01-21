import { createTestClient } from "apollo-server-testing";
import { apolloServer } from "../../src/app";

export default createTestClient(apolloServer as any);
