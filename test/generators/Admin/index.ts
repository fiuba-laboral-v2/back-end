import { ISaveAdmin } from "../../../src/models/Admin";
import { Admin } from "../../../src/models";
import { CustomGenerator } from "../types";

export type TAdminDataGenerator = CustomGenerator<ISaveAdmin>;
export type TAdminGenerator = CustomGenerator<Promise<Admin>>;

export { GraduadosAdminGenerator } from "./graduadosAdminGenerator";
export { ExtensionAdminGenerator } from "./extensionAdminGenerator";
