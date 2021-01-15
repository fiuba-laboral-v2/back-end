import { nonNull, ID, Int } from "$graphql/fieldTypes";
import { IApolloServerContext } from "$graphql/Context";
import { UserRepository } from "$models/User";
import { CompanyUserRepository, DeleteLastCompanyUserError } from "$models/CompanyUser";
import { UnauthorizedError } from "$graphql/Errors";

export const deleteCompanyUser = {
  type: Int,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (
    _: undefined,
    { uuid }: IDeleteCompanyUser,
    { currentUser }: IApolloServerContext
  ) => {
    const { companyUuid } = currentUser.getCompanyRole();
    const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
    if (companyUsers.length === 1) throw new DeleteLastCompanyUserError(companyUuid);

    const companyUser = await CompanyUserRepository.findByUuid(uuid);
    if (companyUser.companyUuid !== companyUuid) throw new UnauthorizedError();

    const user = await UserRepository.findByUuid(companyUser.userUuid);
    await UserRepository.delete(user);
  }
};

export interface IDeleteCompanyUser {
  uuid: string;
}
