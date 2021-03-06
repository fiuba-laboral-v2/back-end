import { UserNotFoundError } from "./Errors";
import { Transaction } from "sequelize/types";
import { UserSequelizeModel } from "$models";
import { CompanyUserRepository } from "$models/CompanyUser";
import { User } from "./User";
import { UserMapper } from "./Mapper";

export const UserRepository = {
  save: async (user: User, transaction?: Transaction) => {
    const sequelizeModel = UserMapper.toPersistenceModel(user);
    await sequelizeModel.save({ transaction });
    user.setUuid(sequelizeModel.uuid);
  },
  delete: async (user: User) => {
    const sequelizeModel = UserMapper.toPersistenceModel(user);
    await sequelizeModel.destroy();
  },
  findCompanyUserByEmail: async (email: string) => {
    const sequelizeModel = await UserSequelizeModel.findOne({ where: { email, dni: null } });
    if (!sequelizeModel) throw new UserNotFoundError({ email });

    return UserMapper.toDomainModel(sequelizeModel);
  },
  findFiubaUserByDni: async (dni: string) => {
    const sequelizeModel = await UserSequelizeModel.findOne({ where: { dni, password: null } });
    if (!sequelizeModel) throw new UserNotFoundError({ dni });

    return UserMapper.toDomainModel(sequelizeModel);
  },
  findByEmail: async (email: string) => {
    const sequelizeModel = await UserSequelizeModel.findOne({ where: { email } });
    if (!sequelizeModel) throw new UserNotFoundError({ email });

    return UserMapper.toDomainModel(sequelizeModel);
  },
  findByDni: async (dni: string) => {
    const sequelizeModel = await UserSequelizeModel.findOne({ where: { dni } });
    if (!sequelizeModel) throw new UserNotFoundError({ dni });

    return UserMapper.toDomainModel(sequelizeModel);
  },
  findByUuid: async (uuid: string) => {
    const sequelizeModel = await UserSequelizeModel.findByPk(uuid);
    if (!sequelizeModel) throw new UserNotFoundError({ uuid });

    return UserMapper.toDomainModel(sequelizeModel);
  },
  findByUuids: async (uuids: string[]) => {
    const sequelizeModels = await UserSequelizeModel.findAll({ where: { uuid: uuids } });
    return sequelizeModels.map(UserMapper.toDomainModel);
  },
  findByCompanyUuid: async (companyUuid: string) => {
    const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
    const userUuids = companyUsers.map(companyUser => companyUser.userUuid);
    return UserRepository.findByUuids(userUuids);
  },
  findAll: async () => {
    const sequelizeModels = await UserSequelizeModel.findAll();
    return sequelizeModels.map(UserMapper.toDomainModel);
  },
  truncate: () => UserSequelizeModel.truncate({ cascade: true })
};
