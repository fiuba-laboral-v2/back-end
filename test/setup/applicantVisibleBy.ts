import { Applicant } from "$models";
import { ApplicantType } from "$models/Applicant";
import { Secretary } from "$models/Admin";

export const applicantVisibleBy = async (applicant: Applicant, secretary: Secretary) => {
  const applicantType = await applicant.getType();
  const graduateTypes = [ApplicantType.both, ApplicantType.graduate];
  const isGraduate = secretary === Secretary.graduados;
  if (isGraduate && graduateTypes.includes(applicantType)) return true;
  return !isGraduate && !graduateTypes.includes(applicantType);
};
