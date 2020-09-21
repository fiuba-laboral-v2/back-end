import { uuids } from "../../../uuids";
import { sections } from "../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";

export const javaJunior = {
  offer: {
    uuid: uuids.offers.java_junior,
    companyUuid: uuids.companies.devartis,
    title: "Desarrollador Java junior",
    targetApplicantType: ApplicantType.student,
    description,
    hoursPerDay: 6,
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.java_junior)
};
