import { uuids } from "../../../uuids";
import { sections } from "../../sections";
import { description } from "../description";
import { ApplicantType } from "../../../../../models/Applicant/Interface";
import { ApprovalStatus } from "../../../../../models/ApprovalStatus";
import { DateTimeManager } from "../../../../../libs/DateTimeManager";

export const pythonSemiSeniorExpiredForOne = {
  offer: {
    uuid: uuids.offers.pythonSemiSeniorExpiredForOne,
    companyUuid: uuids.companies.devartis.uuid,
    title: "Desarrollador Python semi senior",
    targetApplicantType: ApplicantType.both,
    description,
    isInternship: false,
    hoursPerDay: 6,
    extensionApprovalStatus: ApprovalStatus.approved,
    graduadosApprovalStatus: ApprovalStatus.approved,
    graduatesExpirationDateTime: DateTimeManager.daysFromNow(3).toDate(),
    studentsExpirationDateTime: DateTimeManager.yesterday(),
    minimumSalary: 52500,
    maximumSalary: 70000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  offerSections: sections(uuids.offers.pythonSemiSeniorExpiredForOne)
};
