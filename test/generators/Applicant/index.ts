import { applicantsWithMinimumData } from "./applicantsWithMinimumData";
import { Applicant, ApplicantRepository } from "../../../src/models/Applicant";

export type TApplicantGenerator = Generator<Promise<Applicant>, Promise<Applicant>, boolean>;

export const ApplicantGenerator = {
  withMinimumData: function*(): TApplicantGenerator {
    for (const applicantData of applicantsWithMinimumData) {
      yield ApplicantRepository.create(applicantData);
    }
    throw new Error("There are no more applicants to generate");
  }
};
