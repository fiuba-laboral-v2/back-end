import { User } from "./User";
import { UserSequelizeModel } from "./Model";
import {
  FiubaCredentials,
  CompanyUserHashedCredentials,
  CompanyUserRawCredentials
} from "./Credentials";
import { ICredentials } from "$models/User/Interface";

export const UserMapper = {
  toPersistenceModel: (user: User) => {
    const credentials = user.credentials;
    if (credentials instanceof FiubaCredentials) {
      return new UserSequelizeModel({
        uuid: user.uuid,
        name: user.name,
        surname: user.surname,
        email: user.email,
        dni: credentials.dni
      });
    }
    if (credentials instanceof CompanyUserRawCredentials) {
      return new UserSequelizeModel({
        uuid: user.uuid,
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: credentials.password
      });
    }
    if (credentials instanceof CompanyUserHashedCredentials) {
      return new UserSequelizeModel({
        uuid: user.uuid,
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: credentials.password
      });
    }
    throw new Error();
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
