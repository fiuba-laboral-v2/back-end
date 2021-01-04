import { uuids } from "../../../uuids";
import { sections } from "../../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { ApprovalStatus } from "../../../../../models/ApprovalStatus";
import { DateTimeManager } from "../../../../../libs/DateTimeManager";
import moment from "moment";

export const cobolSemiSeniorApproved = {
  offer: {
    uuid: uuids.offers.cobolSemiSeniorApproved,
    companyUuid: uuids.companies.devartis.uuid,
    title: "Desarrollador Cobol semi senior",
    targetApplicantType: ApplicantType.both,
    description,
    isInternship: false,
    hoursPerDay: 6,
    extensionApprovalStatus: ApprovalStatus.approved,
    graduadosApprovalStatus: ApprovalStatus.approved,
    graduatesExpirationDateTime: DateTimeManager.daysFromNow(15).toDate(),
    studentsExpirationDateTime: DateTimeManager.daysFromNow(15).toDate(),
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: moment().endOf("day").subtract(16, "days").toDate(),
    updatedAt: moment().endOf("day").subtract(16, "days").toDate()
  },
  offerSections: sections(uuids.offers.cobolSemiSeniorApproved)
};
