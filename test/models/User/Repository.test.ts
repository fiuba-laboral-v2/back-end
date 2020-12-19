import {
  FiubaCredentials,
  CompanyUserRawCredentials,
  CompanyUserHashedCredentials
} from "$models/User/Credentials";
import { UserRepository } from "$models/User";
import { ICredentials, User, UserNotFoundError } from "$models/User";
import { UniqueConstraintError } from "sequelize";
import { UUID } from "$models/UUID";

import { EmailGenerator } from "$generators/Email";
import { DniGenerator } from "$generators/DNI";
import { UUID_REGEX } from "$test/models";
import arrayContaining = jasmine.arrayContaining;

describe("UserRepository", () => {
  beforeAll(() => UserRepository.truncate());

  const userAttributes = () => ({
    name: "name",
    surname: "surname",
    email: EmailGenerator.generate()
  });

  describe("save", () => {
    const expectUserToBeSaved = async (user: User) => {
      await UserRepository.save(user);
      const { credentials, ...attributes } = await UserRepository.findByUuid(user.uuid!);
      expect(user).toBeObjectContaining(attributes);
      expect(user.credentials).toBeObjectContaining(credentials);
    };

    const expectToGenerateUuidAfterItIsSaved = async (user: User) => {
      expect(user.uuid).toBeUndefined();
      await UserRepository.save(user);
      expect(user.uuid).toEqual(expect.stringMatching(UUID_REGEX));
    };

    const expectToThrowErrorOnUniqueUuidConstraint = async (user: User) => {
      const uuid = UUID.generate();
      jest.spyOn(UUID, "generate").mockImplementation(() => uuid);
      await UserRepository.save(user);
      expect(user.uuid).toEqual(uuid);
      const credentials = new CompanyUserRawCredentials({ password: "fdmgkfHGH4353" });
      const anotherUser = new User({ ...userAttributes(), credentials });
      await expect(UserRepository.save(anotherUser)).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
    };

    const expectToThrowErrorOnUniqueEmailConstraint = async (user: User) => {
      const email = user.email;
      await UserRepository.save(user);
      const credentials = new CompanyUserRawCredentials({ password: "fdmgkfHGH4353" });
      const anotherUser = new User({ ...userAttributes(), email, credentials });
      await expect(UserRepository.save(anotherUser)).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
    };

    describe("User with CompanyUserRawCredentials", () => {
      const credentials = new CompanyUserRawCredentials({ password: "fdmgkfHGH4353" });

      it("saves the user in the database", async () => {
        const user = new User({ ...userAttributes(), credentials });
        await expectUserToBeSaved(user);
      });

      it("generates an uuid after it is saved", async () => {
        const user = new User({ ...userAttributes(), credentials });
        await expectToGenerateUuidAfterItIsSaved(user);
      });

      it("throws an error if the another user with the same uuid already exist", async () => {
        const user = new User({ ...userAttributes(), credentials });
        await expectToThrowErrorOnUniqueUuidConstraint(user);
      });

      it("throws an error if the another user with the same email already exist", async () => {
        const user = new User({ ...userAttributes(), credentials });
        await expectToThrowErrorOnUniqueEmailConstraint(user);
      });
    });

    describe("User with CompanyUserHashedCredentials", () => {
      const hashedPassword = "$2b$10$KrYD1NqSyMabjPoZu2UZS.ZI5/5CN5cjQ/5FQhGCbsyhuUClkdU/q";
      const credentials = new CompanyUserHashedCredentials({ password: hashedPassword });

      it("saves the user in the database", async () => {
        const user = new User({ ...userAttributes(), credentials });
        await expectUserToBeSaved(user);
      });

      it("generates an uuid after it is saved", async () => {
        const user = new User({ ...userAttributes(), credentials });
        await expectToGenerateUuidAfterItIsSaved(user);
      });

      it("throws an error if the another user with the same uuid already exist", async () => {
        const user = new User({ ...userAttributes(), credentials });
        await expectToThrowErrorOnUniqueUuidConstraint(user);
      });

      it("throws an error if the another user with the same email already exist", async () => {
        const user = new User({ ...userAttributes(), credentials });
        await expectToThrowErrorOnUniqueEmailConstraint(user);
      });
    });

    describe("User with FiubaCredentials", () => {
      it("saves the user in the database", async () => {
        const credentials = new FiubaCredentials(DniGenerator.generate());
        const user = new User({ ...userAttributes(), credentials });
        await expectUserToBeSaved(user);
      });

      it("generates an uuid after it is saved", async () => {
        const credentials = new FiubaCredentials(DniGenerator.generate());
        const user = new User({ ...userAttributes(), credentials });
        await expectToGenerateUuidAfterItIsSaved(user);
      });

      it("throws an error if the another user with the same uuid already exist", async () => {
        const credentials = new FiubaCredentials(DniGenerator.generate());
        const user = new User({ ...userAttributes(), credentials });
        await expectToThrowErrorOnUniqueUuidConstraint(user);
      });

      it("throws an error if the another user with the same email already exist", async () => {
        const credentials = new FiubaCredentials(DniGenerator.generate());
        const user = new User({ ...userAttributes(), credentials });
        await expectToThrowErrorOnUniqueEmailConstraint(user);
      });

      it("throws an error if the another user with the same dni already exist", async () => {
        const credentials = new FiubaCredentials(DniGenerator.generate());
        const user = new User({ ...userAttributes(), credentials });
        await UserRepository.save(user);
        const anotherUser = new User({ ...userAttributes(), credentials });
        await expect(UserRepository.save(anotherUser)).rejects.toThrowErrorWithMessage(
          UniqueConstraintError,
          "Validation error"
        );
      });
    });
  });

  describe("findByUuid", () => {
    const expectToFindUserByUuid = async (credentials: ICredentials) => {
      const user = new User({ ...userAttributes(), credentials });
      await UserRepository.save(user);
      const persistedUser = await UserRepository.findByUuid(user.uuid!);
      expect(persistedUser).toEqual(user);
    };

    it("finds a user with FiubaCredentials by uuid", async () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      await expectToFindUserByUuid(credentials);
    });

    it("finds a user with CompanyUserRawCredentials by uuid", async () => {
      const credentials = new CompanyUserRawCredentials({ password: "fdmgkfHGH4353" });
      await expectToFindUserByUuid(credentials);
    });

    it("finds a user with CompanyUserHashedCredentials by uuid", async () => {
      const hashedPassword = "$2b$10$KrYD1NqSyMabjPoZu2UZS.ZI5/5CN5cjQ/5FQhGCbsyhuUClkdU/q";
      const credentials = new CompanyUserHashedCredentials({ password: hashedPassword });
      await expectToFindUserByUuid(credentials);
    });

    it("throws an error if the given uuid does not belong to a persisted user", async () => {
      const uuid = UUID.generate();
      await expect(UserRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ uuid })
      );
    });
  });

  describe("findCompanyUserByEmail", () => {
    it("finds a user with CompanyUserCredentials by email", async () => {
      const credentials = new CompanyUserRawCredentials({ password: "fdmgkfHGH4353" });
      const user = new User({ ...userAttributes(), credentials });
      await UserRepository.save(user);
      const persistedUser = await UserRepository.findCompanyUserByEmail(user.email);
      expect(persistedUser).toEqual(user);
    });

    it("throws an error if the email belongs to a user with FiubaCredentials", async () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      const user = new User({ ...userAttributes(), credentials });
      await UserRepository.save(user);
      const email = user.email;
      await expect(UserRepository.findCompanyUserByEmail(email)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ email })
      );
    });

    it("throws an error if the given email does not belong to a persisted user", async () => {
      const email = "notPersisted@gmail.com.ar";
      await expect(UserRepository.findCompanyUserByEmail(email)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ email })
      );
    });
  });

  describe("findFiubaUserByDni", () => {
    it("finds a user with FiubaCredentials by dni", async () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      const user = new User({ ...userAttributes(), credentials });
      await UserRepository.save(user);
      const persistedUser = await UserRepository.findFiubaUserByDni(credentials.dni);
      expect(persistedUser).toEqual(user);
    });

    it("throws an error if given dni is null", async () => {
      const dni = null as any;
      await expect(UserRepository.findFiubaUserByDni(dni)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ dni })
      );
    });

    it("throws an error if the dni email does not belong to a persisted user", async () => {
      const dni = DniGenerator.generate();
      await expect(UserRepository.findFiubaUserByDni(dni)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ dni })
      );
    });
  });

  describe("findByEmail", () => {
    const expectToFindUserByEmail = async (credentials: ICredentials) => {
      const user = new User({ ...userAttributes(), credentials });
      await UserRepository.save(user);
      const persistedUser = await UserRepository.findByEmail(user.email);
      expect(persistedUser).toEqual(user);
    };

    it("finds a user with FiubaCredentials by email", async () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      await expectToFindUserByEmail(credentials);
    });

    it("finds a user with CompanyUserRawCredentials by email", async () => {
      const credentials = new CompanyUserRawCredentials({ password: "fdmgkfHGH4353" });
      await expectToFindUserByEmail(credentials);
    });

    it("finds a user with CompanyUserHashedCredentials by email", async () => {
      const hashedPassword = "$2b$10$KrYD1NqSyMabjPoZu2UZS.ZI5/5CN5cjQ/5FQhGCbsyhuUClkdU/q";
      const credentials = new CompanyUserHashedCredentials({ password: hashedPassword });
      await expectToFindUserByEmail(credentials);
    });

    it("throws an error if the given email does not belong to a persisted user", async () => {
      const email = "notPersisted@gmail.com.ar";
      await expect(UserRepository.findByEmail(email)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ email })
      );
    });
  });

  describe("findByDni", () => {
    it("finds a user with FiubaCredentials by dni", async () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      const user = new User({ ...userAttributes(), credentials });
      await UserRepository.save(user);
      const persistedUser = await UserRepository.findByDni(credentials.dni);
      expect(persistedUser).toEqual(user);
    });

    it("throws an error if the given dni does not belong to a persisted user", async () => {
      const dni = "123";
      await expect(UserRepository.findByDni(dni)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ dni })
      );
    });
  });

  describe("findByUuids", () => {
    it("finds a users by uuids", async () => {
      const fiubaUser = new User({
        ...userAttributes(),
        credentials: new FiubaCredentials(DniGenerator.generate())
      });
      const companyUser = new User({
        ...userAttributes(),
        credentials: new CompanyUserHashedCredentials({
          password: "$2b$10$KrYD1NqSyMabjPoZu2UZS.ZI5/5CN5cjQ/5FQhGCbsyhuUClkdU/q"
        })
      });

      await UserRepository.save(fiubaUser);
      await UserRepository.save(companyUser);
      const uuids = [fiubaUser.uuid!, companyUser.uuid!];
      const users = await UserRepository.findByUuids(uuids);
      expect(users).toEqual(arrayContaining([fiubaUser, companyUser]));
    });

    it("returns an empty array if the given uuids are not persisted", async () => {
      const uuids = [UUID.generate(), UUID.generate()];
      const users = await UserRepository.findByUuids(uuids);
      expect(users).toEqual([]);
    });
  });

  describe("truncate", () => {
    it("returns an empty array if the table is truncated", async () => {
      const credentials = new FiubaCredentials(DniGenerator.generate());
      const user = new User({ ...userAttributes(), credentials });
      await UserRepository.save(user);
      expect((await UserRepository.findAll()).length).toBeGreaterThan(0);
      await UserRepository.truncate();
      expect(await UserRepository.findAll()).toHaveLength(0);
    });
  });
});
