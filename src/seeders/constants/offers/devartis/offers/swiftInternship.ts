import { uuids } from "../../../uuids";
import { sections } from "../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";

export const swiftInternship = {
  offer: {
    uuid: uuids.offers.swiftInternship,
    companyUuid: uuids.companies.devartis,
    title: "Pasantía: desarrollador Swift",
    targetApplicantType: ApplicantType.student,
    description,
    isInternship: true,
    hoursPerDay: 6,
    minimumSalary: 33000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.swiftInternship)
};
