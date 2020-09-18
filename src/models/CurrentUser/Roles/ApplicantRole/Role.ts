import { ApplicantPermissions } from "$models/Permissions";

export class ApplicantRole {
  public applicantUuid: string;

  constructor(applicantUuid: string) {
    this.applicantUuid = applicantUuid;
  }

  public getPermissions() {
    return new ApplicantPermissions(this.applicantUuid);
  }
}
