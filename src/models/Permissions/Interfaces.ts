import { JobApplication, Offer } from "$models";

export interface IPermissions {
  canPublishInternship: () => Promise<boolean>;
  canSeeOffer: (offer: Offer) => Promise<boolean>;
  canModerateOffer: (offer: Offer) => Promise<boolean>;
  canModerateJobApplication: (jobApplication: JobApplication) => Promise<boolean>;
}

export interface IPermission {
  apply: () => Promise<boolean> | boolean;
}
