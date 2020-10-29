import { uuids } from "../../../uuids";
import { sections } from "../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";

export const rubySenior = {
  offer: {
    uuid: uuids.offers.rubySenior,
    companyUuid: uuids.companies.devartis,
    title: "Desarrollador Ruby senior",
    targetApplicantType: ApplicantType.both,
    description,
    isInternship: false,
    hoursPerDay: 6,
    minimumSalary: 52500,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.rubySenior)
};
