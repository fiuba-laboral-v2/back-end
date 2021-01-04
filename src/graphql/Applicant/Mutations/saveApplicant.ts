import { Int, List, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLApplicantCareerInput } from "../Types/GraphQLApplicantCareerInput";

import {
  FiubaCredentials,
  ICreateFiubaUser,
  User,
  UserNotFoundError,
  UserRepository
} from "$models/User";
import { ApplicantRepository } from "$models/Applicant";
import { GraphQLUserCreateInput } from "$graphql/User/Types/GraphQLUserCreateInput";
import { ApplicantCareersRepository, IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { Database } from "$config";
import { Applicant } from "$models";
import { ApplicantCapabilityRepository } from "$models/ApplicantCapability";

export const saveApplicant = {
  type: nonNull(GraphQLApplicant),
  args: {
    padron: {
      type: nonNull(Int)
    },
    description: {
      type: String
    },
    careers: {
      type: nonNull(List(GraphQLApplicantCareerInput))
    },
    capabilities: {
      type: List(String)
    },
    user: {
      type: nonNull(GraphQLUserCreateInput)
    }
  },
  resolve: async (
    _: undefined,
    { user: userAttributes, careers, capabilities, padron, description }: ISaveApplicant
  ) => {
    const { name, surname, email, dni, password } = userAttributes;
    let user: User;
    try {
      user = await UserRepository.findFiubaUserByDni(dni);
    } catch (error) {
      if (!(error instanceof UserNotFoundError)) throw error;
      user = new User({ name, surname, email, credentials: new FiubaCredentials(dni) });
    }
    await user.credentials.authenticate(password);

    return Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      const applicant = new Applicant({ padron, description, userUuid: user.uuid });
      await ApplicantRepository.save(applicant, transaction);
      await ApplicantCareersRepository.bulkCreate(careers, applicant, transaction);
      await ApplicantCapabilityRepository.update(capabilities || [], applicant, transaction);
      return applicant;
    });
  }
};

export interface ISaveApplicant {
  user: ICreateFiubaUser;
  padron: number;
  description?: string;
  careers: IApplicantCareer[];
  capabilities?: string[];
}
