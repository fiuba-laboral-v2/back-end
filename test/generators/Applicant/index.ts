import { applicantsWithMinimumData } from "./applicantsWithMinimumData";
import { Applicant, ApplicantRepository } from "../../../src/models/Applicant";
import { CustomGenerator } from "../types";

export type TApplicantGenerator = CustomGenerator<Promise<Applicant>>;

export const ApplicantGenerator = {
  withMinimumData: function*(): TApplicantGenerator {
    for (const applicantData of applicantsWithMinimumData) {
      yield ApplicantRepository.create(applicantData);
    }
    throw new Error("There are no more applicants to generate");
  }
};
