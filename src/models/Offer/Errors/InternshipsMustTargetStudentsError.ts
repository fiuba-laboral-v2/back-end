export class InternshipsMustTargetStudentsError extends Error {
  public static buildMessage() {
    return "Internships have to target students";
  }

  constructor() {
    super(InternshipsMustTargetStudentsError.buildMessage());
  }
}
