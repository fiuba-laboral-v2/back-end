import { uuids } from "../../../uuids";
import { sections } from "../../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { ApprovalStatus } from "../../../../../models/ApprovalStatus";

export const rubyJunior = {
  offer: {
    uuid: uuids.offers.rubyJunior,
    companyUuid: uuids.companies.devartis.uuid,
    title: "Desarrollador Ruby junior",
    targetApplicantType: ApplicantType.student,
    description,
    isInternship: false,
    hoursPerDay: 6,
    extensionApprovalStatus: ApprovalStatus.pending,
    graduadosApprovalStatus: ApprovalStatus.pending,
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.rubyJunior)
};
