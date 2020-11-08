import {
  And,
  isApprovalStatus,
  isUuid,
  isTargetApplicantType
} from "$models/SequelizeModelValidators";

describe("And", () => {
  it("it creates a new ModelValidateOptions object with all the SequelizeModelValidators pass", () => {
    const validator = And(isApprovalStatus, isUuid, isTargetApplicantType);

    expect(validator).toEqual({
      validate: {
        ...isApprovalStatus.validate,
        ...isUuid.validate,
        ...isTargetApplicantType.validate
      }
    });
  });
});
