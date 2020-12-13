export class InternshipsCannotHaveMaximumSalaryError extends Error {
  public static buildMessage() {
    return "Internships can't have maximum salary";
  }

  constructor() {
    super(InternshipsCannotHaveMaximumSalaryError.buildMessage());
  }
}
