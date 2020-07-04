import { ApprovableEntityType, ApprovableModelsType } from "./Model";

export interface IApprovableFilterOptions {
  approvableEntityTypes?: ApprovableEntityType[];
}

export interface IFindApprovableAttributes {
  approvableModels: ApprovableModelsType[];
}
