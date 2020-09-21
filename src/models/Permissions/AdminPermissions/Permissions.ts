import { Offer } from "$models";
import { IPermission } from "../Interface";
import { AdminRepository, Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Applicant";

export class AdminPermissions implements IPermission {
  private readonly adminUserUuid: string;

  constructor(adminUserUuid: string) {
    this.adminUserUuid = adminUserUuid;
  }

  public canSeeOffer(_: Offer) {
    return Promise.resolve(true);
  }

  public async canModerateOffer(offer: Offer) {
    const targetApplicantType = offer.targetApplicantType;
    if (targetApplicantType === ApplicantType.both) return true;

    const { secretary } = await AdminRepository.findByUserUuid(this.adminUserUuid);
    return (
      {
        [Secretary.graduados]: ApplicantType.graduate,
        [Secretary.extension]: ApplicantType.student
      }[secretary] === targetApplicantType
    );
  }
}
