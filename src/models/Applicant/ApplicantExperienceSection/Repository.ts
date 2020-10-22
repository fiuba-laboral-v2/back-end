import { Applicant, ApplicantExperienceSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

export class ApplicantExperienceSectionRepository extends SectionRepository {
  public async update({
    applicant,
    ...updateArguments
  }: IUpdateProps & { applicant: Applicant }): Promise<ApplicantExperienceSection[]> {
    return super.updateSection({ model: applicant, ...updateArguments });
  }

  public findByApplicant(applicant: Applicant): Promise<ApplicantExperienceSection[]> {
    return super.findByEntity({ model: applicant });
  }

  protected modelClass() {
    return ApplicantExperienceSection;
  }

  protected entityUuidKey() {
    return "applicantUuid";
  }
}
