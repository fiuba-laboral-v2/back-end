import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import {
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification,
  RejectedProfileApplicantNotification,
  ApplicantNotificationRepository
} from "$models/ApplicantNotification";
import { Notification } from "../Model";
import { UnknownRepositoryError } from "../Errors";
import { Transaction } from "sequelize";

const repositoryMapper = {
  [NewJobApplicationCompanyNotification.name]: CompanyNotificationRepository,
  [ApprovedOfferCompanyNotification.name]: CompanyNotificationRepository,
  [RejectedOfferCompanyNotification.name]: CompanyNotificationRepository,
  [ApprovedJobApplicationApplicantNotification.name]: ApplicantNotificationRepository,
  [RejectedJobApplicationApplicantNotification.name]: ApplicantNotificationRepository,
  [ApprovedProfileApplicantNotification.name]: ApplicantNotificationRepository,
  [RejectedProfileApplicantNotification.name]: ApplicantNotificationRepository
};

export const NotificationRepositoryFactory = {
  getRepositoryFor: (notification: Notification): INotificationRepository => {
    const className = notification.constructor.name;
    const repository = repositoryMapper[className];
    if (!repository) throw new UnknownRepositoryError(className);

    return repository;
  }
};

interface INotificationRepository {
  save: (notification: Notification, transaction?: Transaction) => Promise<void>;
}
