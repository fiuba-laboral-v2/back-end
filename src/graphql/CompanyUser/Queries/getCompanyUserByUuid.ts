import { ID, nonNull } from "$graphql/fieldTypes";
import { GraphQLCompanyUser } from "../Types/GraphQLCompanyUser";
import { IApolloServerContext } from "$graphql/Context";
import { CompanyUserRepository } from "$models/CompanyUser";
import { UnauthorizedError } from "$graphql/Errors";

export const getCompanyUserByUuid = {
  type: GraphQLCompanyUser,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (
    _: undefined,
    { uuid }: IGetMyCompanyUser,
    { currentUser }: IApolloServerContext
  ) => {
    const { companyUuid } = currentUser.getCompanyRole();
    const companyUser = await CompanyUserRepository.findByUuid(uuid);
    if (companyUser.companyUuid !== companyUuid) throw new UnauthorizedError();

    return companyUser;
  }
};

interface IGetMyCompanyUser {
  uuid: string;
}
