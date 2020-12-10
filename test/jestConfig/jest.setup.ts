import { setupCustomMatchers } from "./customMatchers";
import { setupDatabase } from "./setupDatabase";
import { setupMocks } from "$test/jestConfig/setupMocks";

setupCustomMatchers();
setupDatabase();
setupMocks();
