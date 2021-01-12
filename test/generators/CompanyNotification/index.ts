import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification,
  ApprovedProfileCompanyNotification,
  RejectedProfileCompanyNotification,
  CompanyNotificationRepository,
  CompanyNotification
} from "$models/CompanyNotification";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { OfferGenerator } from "$generators/Offer";
import { Admin, Company, Offer } from "$models";
import { range, sample } from "lodash";
import MockDate from "mockdate";

export const CompanyNotificationGenerator = {
  instance: {
    newJobApplication: async ({ company, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const jobApplication = await JobApplicationGenerator.instance.toTheCompany(companyUuid);
      const attributes = {
        moderatorUuid,
        notifiedCompanyUuid: companyUuid,
        jobApplicationUuid: jobApplication.uuid,
        isNew: true
      };
      const notification = new NewJobApplicationCompanyNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    },
    approvedOffer: async ({ company, admin, offer }: IOfferProps) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const { uuid: offerUuid } =
        offer || (await OfferGenerator.instance.withObligatoryData({ companyUuid }));
      const attributes = {
        moderatorUuid,
        notifiedCompanyUuid: companyUuid,
        offerUuid,
        isNew: true
      };
      const notification = new ApprovedOfferCompanyNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    },
    rejectedOffer: async ({ company, admin, offer }: IOfferProps) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const { uuid: offerUuid } =
        offer || (await OfferGenerator.instance.withObligatoryData({ companyUuid }));
      const attributes = {
        moderatorUuid,
        notifiedCompanyUuid: companyUuid,
        offerUuid,
        moderatorMessage: "message",
        isNew: true
      };
      const notification = new RejectedOfferCompanyNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    },
    approvedProfile: async ({ company, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const attributes = { moderatorUuid, notifiedCompanyUuid: companyUuid };
      const notification = new ApprovedProfileCompanyNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    },
    rejectedProfile: async ({ company, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const attributes = {
        moderatorUuid,
        notifiedCompanyUuid: companyUuid,
        moderatorMessage: "message"
      };
      const notification = new RejectedProfileCompanyNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    },
    range: async ({ company, size }: { size: number; company: Company }) => {
      const admin = await AdminGenerator.extension();
      const values: CompanyNotification[] = [];
      const generators = [
        CompanyNotificationGenerator.instance.newJobApplication,
        CompanyNotificationGenerator.instance.approvedOffer,
        CompanyNotificationGenerator.instance.rejectedOffer,
        CompanyNotificationGenerator.instance.approvedProfile,
        CompanyNotificationGenerator.instance.rejectedProfile
      ];
      for (const milliseconds of range(size)) {
        MockDate.set(milliseconds);
        const generator = sample<Generator>(generators);
        values.push(await generator!({ company, admin }));
        MockDate.reset();
      }
      return values.sort(({ createdAt }) => -createdAt!);
    }
  }
};

type Generator = (attributes: IGeneratorAttributes) => Promise<CompanyNotification>;

interface IGeneratorAttributes {
  company?: Company;
  admin?: Admin;
}

interface IOfferProps extends IGeneratorAttributes {
  offer?: Offer;
}
