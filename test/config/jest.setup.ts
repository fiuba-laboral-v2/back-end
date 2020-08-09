import { setupCustomMatchers } from "./customMatchers";
import { setupDatabase } from "./setupDatabase";
import { setupMocks } from "$test/config/setupMocks";

setupCustomMatchers();
setupDatabase();
setupMocks();
