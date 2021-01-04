import { ApplicantType } from "$models/Applicant";
import { Admin } from "$models";
import { IPermission } from "../Interfaces";
import { Secretary } from "$models/Admin";

export class ApplicantTargetAdminPermission implements IPermission {
  private readonly applicantType: ApplicantType;
  private readonly admin: Admin;

  constructor(admin: Admin, applicantType: ApplicantType) {
    this.admin = admin;
    this.applicantType = applicantType;
  }

  public apply() {
    const applicantTypes = {
      [Secretary.graduados]: [ApplicantType.graduate, ApplicantType.both],
      [Secretary.extension]: [ApplicantType.student]
    }[this.admin.secretary];

    return applicantTypes.includes(this.applicantType);
  }
}
