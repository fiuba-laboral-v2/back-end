import { uuids } from "../../../uuids";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { description } from "../../devartis/description";
import { sections } from "../../devartis/sections";

export const kotlinInternship = {
  offer: {
    uuid: uuids.offers.kotlinInternship,
    companyUuid: uuids.companies.mercadoLibre,
    title: "Pasantía: desarrollador Kotlin",
    targetApplicantType: ApplicantType.student,
    description,
    isInternship: true,
    hoursPerDay: 6,
    minimumSalary: 44000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.kotlinInternship)
};
