export class CompanyWithNoInternshipAgreementError extends Error {
  public static buildMessage() {
    return "Company with no internship agreement cannot publish or edit an internship offer";
  }

  constructor() {
    super(CompanyWithNoInternshipAgreementError.buildMessage());
  }
}
