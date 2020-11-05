import { uuids } from "../../../uuids";
import { sections } from "../../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";

export const rubySemiSenior = {
  offer: {
    uuid: uuids.offers.rubySemiSenior,
    companyUuid: uuids.companies.devartis.uuid,
    title: "Desarrollador Ruby semi senior",
    targetApplicantType: ApplicantType.student,
    description,
    isInternship: false,
    hoursPerDay: 6,
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.rubySemiSenior)
};
