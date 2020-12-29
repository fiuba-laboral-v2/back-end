export class JobApplicationNotFoundError extends Error {
  public static buildMessage(uuid?: string) {
    if (!uuid) return "JobApplication not found";
    return `JobApplication with uuid: ${uuid} does not exist`;
  }

  constructor(uuid?: string) {
    super(JobApplicationNotFoundError.buildMessage(uuid));
  }
}
