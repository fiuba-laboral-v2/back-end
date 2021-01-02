import { saveCompanyUser } from "./saveCompanyUser";
import { updatePassword } from "./updatePassword";
import { updateMyForgottenPassword } from "./updateMyForgottenPassword";
import { sendPasswordRecoveryEmail } from "./sendPasswordRecoveryEmail";
import { updateCompanyUser } from "./updateCompanyUser";

export const companyUserMutations = {
  saveCompanyUser,
  updatePassword,
  updateMyForgottenPassword,
  sendPasswordRecoveryEmail,
  updateCompanyUser
};
