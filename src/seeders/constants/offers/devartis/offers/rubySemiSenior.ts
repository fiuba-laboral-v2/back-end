import { uuids } from "../../../uuids";
import { sections } from "../sections";
import { description } from "../description";
import { TargetApplicantType } from "../../../../../models/Offer/Interface";

export const rubySemiSenior = {
  offer: {
    uuid: uuids.offers.ruby_semi_senior,
    companyUuid: uuids.companies.devartis,
    title: "Desarrollador Ruby semi senior",
    targetApplicantType: TargetApplicantType.student,
    description,
    hoursPerDay: 6,
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.ruby_semi_senior)
};
