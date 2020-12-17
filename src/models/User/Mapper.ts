import { User } from "./User";
import { UserSequelizeModel } from "./Model";
import {
  CompanyUserHashedCredentials,
  CompanyUserRawCredentials,
  FiubaCredentials
} from "./Credentials";
import { ICredentials } from "$models/User/Interface";

export const UserMapper = {
  toPersistenceModel: (user: User) => {
    const { credentials, ...commonAttributes } = user;
    let additionalAttributes = {};
    if (credentials instanceof FiubaCredentials) {
      additionalAttributes = { dni: credentials.dni };
    }
    if (credentials instanceof CompanyUserRawCredentials) {
      additionalAttributes = { password: credentials.password };
    }
    if (credentials instanceof CompanyUserHashedCredentials) {
      additionalAttributes = { password: credentials.password };
    }
    return new UserSequelizeModel({ ...commonAttributes, ...additionalAttributes });
  },
  toDomainModel: (sequelizeModel: UserSequelizeModel) => {
    let credentials: ICredentials;
    if (sequelizeModel.isFiubaUser()) {
      credentials = new FiubaCredentials(sequelizeModel.dni);
    } else {
      credentials = new CompanyUserHashedCredentials({ password: sequelizeModel.password });
    }
    return new User({
      uuid: sequelizeModel.uuid,
      name: sequelizeModel.name,
      surname: sequelizeModel.surname,
      email: sequelizeModel.email,
      credentials
    });
  }
};
