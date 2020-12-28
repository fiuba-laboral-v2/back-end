export interface IApplicantPermission {
  apply: () => Promise<boolean> | boolean;
}
