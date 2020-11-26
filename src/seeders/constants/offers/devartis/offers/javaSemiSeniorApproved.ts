import { uuids } from "../../../uuids";
import { sections } from "../../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { ApprovalStatus } from "../../../../../models/ApprovalStatus";
import moment from "moment";

export const javaSemiSeniorApproved = {
  offer: {
    uuid: uuids.offers.javaSemiSeniorApproved,
    companyUuid: uuids.companies.devartis.uuid,
    title: "Desarrollador Java semi senior",
    targetApplicantType: ApplicantType.both,
    description,
    isInternship: false,
    hoursPerDay: 6,
    extensionApprovalStatus: ApprovalStatus.approved,
    graduadosApprovalStatus: ApprovalStatus.approved,
    graduatesExpirationDateTime: moment().endOf("day").add(15, "days").toDate(),
    studentsExpirationDateTime: moment().endOf("day").add(15, "days").toDate(),
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: moment().endOf("day").subtract(16, "days").toDate(),
    updatedAt: moment().endOf("day").subtract(16, "days").toDate()
  },
  offerSections: sections(uuids.offers.javaSemiSeniorApproved)
};
