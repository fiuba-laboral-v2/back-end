import { createOffer } from "./createOffer";
import { editOffer } from "./editOffer";
import { updateOfferApprovalStatus } from "./updateOfferApprovalStatus";

const offerMutations = {
  createOffer,
  updateOfferApprovalStatus,
  editOffer
};

export { offerMutations };
