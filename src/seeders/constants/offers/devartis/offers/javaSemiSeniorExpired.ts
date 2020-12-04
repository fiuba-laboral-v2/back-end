import { uuids } from "../../../uuids";
import { sections } from "../../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { ApprovalStatus } from "../../../../../models/ApprovalStatus";
import moment from "moment";

export const javaSemiSeniorExpired = {
  offer: {
    uuid: uuids.offers.javaSemiSeniorExpired,
    companyUuid: uuids.companies.devartis.uuid,
    title: "Desarrollador Java semi senior",
    targetApplicantType: ApplicantType.both,
    description,
    isInternship: false,
    hoursPerDay: 6,
    extensionApprovalStatus: ApprovalStatus.approved,
    graduadosApprovalStatus: ApprovalStatus.approved,
    graduatesExpirationDateTime: moment().startOf("day").subtract(1, "days").toDate(),
    studentsExpirationDateTime: moment().startOf("day").subtract(1, "days").toDate(),
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.javaSemiSeniorExpired)
};
