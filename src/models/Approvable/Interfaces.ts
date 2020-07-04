import { ApprovableEntityType, ApprovableModelsType } from "./Model";

export interface IApprovableFilterOptions {
  approvableEntityTypes?: ApprovableEntityType[];
}

export interface IFindApprovableOptions {
  approvableModels: ApprovableModelsType[];
}
