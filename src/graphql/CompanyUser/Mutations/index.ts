import { saveCompanyUser } from "./saveCompanyUser";
import { updatePassword } from "./updatePassword";
import { updateMyForgottenPassword } from "./updateMyForgottenPassword";
import { sendPasswordRecoveryEmail } from "./sendPasswordRecoveryEmail";
import { updateCompanyUser } from "./updateCompanyUser";
import { deleteCompanyUser } from "./deleteCompanyUser";

export const companyUserMutations = {
  saveCompanyUser,
  updatePassword,
  updateMyForgottenPassword,
  sendPasswordRecoveryEmail,
  updateCompanyUser,
  deleteCompanyUser
};
