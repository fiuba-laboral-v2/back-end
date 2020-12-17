import { User, UserMapper } from "$models/User";
import { UserSequelizeModel } from "$models";
import {
  FiubaCredentials,
  CompanyUserHashedCredentials,
  CompanyUserRawCredentials
} from "$models/User/Credentials";
import { UUID } from "$models/UUID";
import { DniGenerator } from "$generators/DNI";

describe("UserMapper", () => {
  const userAttributes = {
    name: "name",
    surname: "surname",
    email: "email@fi.uba.ar"
  };

  describe("toPersistenceModel", () => {
    describe("User with CompanyUserRawCredentials", () => {
      const credentials = new CompanyUserRawCredentials({ password: "fdmgkfHGH4353" });
      const user = new User({ ...userAttributes, credentials });

      it("returns an instance of UserSequelizeModel", async () => {
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel).toBeInstanceOf(UserSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...userAttributes,
          password: credentials.password,
          dni: undefined,
          isNewRecord: true,
          createdAt: undefined,
          updatedAt: undefined
        });
      });

      it("maps a user that has already an uuid", async () => {
        const uuid = UUID.generate();
        user.setUuid(uuid);
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel.uuid).toEqual(uuid);
        expect(persistenceModel.isNewRecord).toBe(false);
        user.setUuid(undefined);
      });
    });

    describe("User with CompanyUserHashedCredentials", () => {
      const hashedPassword = "$2b$10$KrYD1NqSyMabjPoZu2UZS.ZI5/5CN5cjQ/5FQhGCbsyhuUClkdU/q";
      const credentials = new CompanyUserHashedCredentials({ password: hashedPassword });
      const user = new User({ ...userAttributes, credentials });

      it("returns an instance of UserSequelizeModel", async () => {
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel).toBeInstanceOf(UserSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...userAttributes,
          password: hashedPassword,
          dni: undefined,
          isNewRecord: true,
          createdAt: undefined,
          updatedAt: undefined
        });
      });

      it("maps a user that has already an uuid", async () => {
        const uuid = UUID.generate();
        user.setUuid(uuid);
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel.uuid).toEqual(uuid);
        expect(persistenceModel.isNewRecord).toBe(false);
        user.setUuid(undefined);
      });
    });

    describe("User with FiubaCredentials", () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      const user = new User({ ...userAttributes, credentials });

      it("returns an instance of UserSequelizeModel", async () => {
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel).toBeInstanceOf(UserSequelizeModel);
      });

      it("returns a SequelizeModel with the correct attributes", async () => {
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel).toBeObjectContaining({
          uuid: null,
          ...userAttributes,
          password: undefined,
          dni: credentials.dni,
          isNewRecord: true,
          createdAt: undefined,
          updatedAt: undefined
        });
      });

      it("maps a user that has already an uuid", async () => {
        const uuid = UUID.generate();
        user.setUuid(uuid);
        const persistenceModel = UserMapper.toPersistenceModel(user);
        expect(persistenceModel.uuid).toEqual(uuid);
        expect(persistenceModel.isNewRecord).toBe(false);
        user.setUuid(undefined);
      });
    });
  });

  describe("toDomainModel", () => {
    it("returns a user with CompanyUserHashedCredentials", () => {
      const attributes = { ...userAttributes, password: "fdmgkfHGH4353" };
      const sequelizeModel = new UserSequelizeModel(attributes);
      const domainModel = UserMapper.toDomainModel(sequelizeModel);
      expect(domainModel.credentials).toBeInstanceOf(CompanyUserHashedCredentials);
      expect(domainModel).toBeObjectContaining(userAttributes);
      expect(domainModel.uuid).toEqual(sequelizeModel.uuid);
    });

    it("returns a user with FiubaCredentials", () => {
      const attributes = { ...userAttributes, dni: DniGenerator.generate() };
      const sequelizeModel = new UserSequelizeModel(attributes);
      const domainModel = UserMapper.toDomainModel(sequelizeModel);
      expect(domainModel.credentials).toBeInstanceOf(FiubaCredentials);
      expect(domainModel).toBeObjectContaining(userAttributes);
      expect(domainModel.uuid).toEqual(sequelizeModel.uuid);
    });
  });
});
