import { uuids } from "../../../uuids";
import { sections } from "../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Offer/Interface";

export const rubySemiSenior = {
  offer: {
    uuid: uuids.offers.ruby_semi_senior,
    companyUuid: uuids.companies.devartis,
    title: "Desarrollador Ruby semi senior",
    targetApplicantType: ApplicantType.student,
    description,
    hoursPerDay: 6,
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.ruby_semi_senior)
};
