import { Applicant, ApplicantExperienceSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

export class ApplicantExperienceSectionRepository extends SectionRepository {
  public async update({
    applicant,
    ...updateArguments
  }: IUpdateProps & { applicant: Applicant }): Promise<ApplicantExperienceSection[]> {
    return super.updateSection({ owner: applicant, ...updateArguments });
  }

  public findByApplicant(applicant: Applicant): Promise<ApplicantExperienceSection[]> {
    return super.findByEntity({ owner: applicant });
  }

  protected modelClass() {
    return ApplicantExperienceSection;
  }

  protected whereClause(owner: Applicant) {
    return { applicantUuid: owner.uuid };
  }
}
