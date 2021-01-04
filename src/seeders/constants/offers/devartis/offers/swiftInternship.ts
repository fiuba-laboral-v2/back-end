import { uuids } from "../../../uuids";
import { sections } from "../../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { ApprovalStatus } from "../../../../../models/ApprovalStatus";

export const swiftInternship = {
  offer: {
    uuid: uuids.offers.swiftInternship,
    companyUuid: uuids.companies.devartis.uuid,
    title: "Desarrollador Swift",
    targetApplicantType: ApplicantType.student,
    description,
    isInternship: true,
    hoursPerDay: 6,
    extensionApprovalStatus: ApprovalStatus.pending,
    graduadosApprovalStatus: ApprovalStatus.pending,
    minimumSalary: 33000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.swiftInternship)
};
