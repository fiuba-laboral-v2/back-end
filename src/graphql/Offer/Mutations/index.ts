import { createOffer } from "./createOffer";
import { editOffer } from "./editOffer";
import { expireOffer } from "./expireOffer";
import { updateOfferApprovalStatus } from "./updateOfferApprovalStatus";
import { republishOffer } from "./republishOffer";

const offerMutations = {
  createOffer,
  updateOfferApprovalStatus,
  editOffer,
  expireOffer,
  republishOffer
};

export { offerMutations };
