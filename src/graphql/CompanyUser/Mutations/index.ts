import { saveCompanyUser } from "./saveCompanyUser";
import { updatePassword } from "./updatePassword";
import { updateMyForgottenPassword } from "./updateMyForgottenPassword";
import { sendPasswordRecoveryEmail } from "./sendPasswordRecoveryEmail";

export const companyUserMutations = {
  saveCompanyUser,
  updatePassword,
  updateMyForgottenPassword,
  sendPasswordRecoveryEmail
};
