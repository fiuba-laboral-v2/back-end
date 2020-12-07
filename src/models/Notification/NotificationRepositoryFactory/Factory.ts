import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { Notification } from "../Model";

const repositoryMapper = {
  [NewJobApplicationCompanyNotification.name]: CompanyNotificationRepository,
  [ApprovedOfferCompanyNotification.name]: CompanyNotificationRepository
};

export const NotificationRepositoryFactory = {
  getRepositoryFor: (notification: Notification) => {
    const repository = repositoryMapper[notification.constructor.name];
    if (!repository) throw new Error(`no repository found for ${notification.constructor.name}`);

    return repository;
  }
};
