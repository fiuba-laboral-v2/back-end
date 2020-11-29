import { createOffer } from "./createOffer";
import { editOffer } from "./editOffer";
import { expireOffer } from "./expireOffer";
import { updateOfferApprovalStatus } from "./updateOfferApprovalStatus";

const offerMutations = {
  createOffer,
  updateOfferApprovalStatus,
  editOffer,
  expireOffer
};

export { offerMutations };
