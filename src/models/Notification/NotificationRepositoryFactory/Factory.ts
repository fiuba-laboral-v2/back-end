import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import {
  ApprovedJobApplicationApplicantNotification,
  ApplicantNotificationRepository
} from "$models/ApplicantNotification";
import { Notification } from "../Model";
import { Transaction } from "sequelize";

const repositoryMapper = {
  [NewJobApplicationCompanyNotification.name]: CompanyNotificationRepository,
  [ApprovedOfferCompanyNotification.name]: CompanyNotificationRepository,
  [ApprovedJobApplicationApplicantNotification.name]: ApplicantNotificationRepository
};

export const NotificationRepositoryFactory = {
  getRepositoryFor: (notification: Notification): INotificationRepository => {
    const repository = repositoryMapper[notification.constructor.name];
    if (!repository) throw new Error(`no repository found for ${notification.constructor.name}`);

    return repository;
  }
};

interface INotificationRepository {
  save: (notification: Notification, transaction?: Transaction) => Promise<void>;
}
