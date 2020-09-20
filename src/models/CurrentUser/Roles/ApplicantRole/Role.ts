import { ApplicantPermissions } from "$models/Permissions";
import { IRole } from "../Interface";

export class ApplicantRole implements IRole {
  public applicantUuid: string;

  constructor(applicantUuid: string) {
    this.applicantUuid = applicantUuid;
  }

  public getPermissions() {
    return new ApplicantPermissions(this.applicantUuid);
  }
}
