import { UniqueConstraintError, ValidationError } from "sequelize";
import { UserRepository } from "$models/User/Repository";
import { FiubaUserNotFoundError, UserNotFoundError } from "$models/User";
import { UUID } from "$models/UUID";
import { FiubaUsersService } from "$services";
import { InvalidEmptyUsernameError } from "$services/FiubaUsers";
import { UUID_REGEX } from "../index";
import {
  InvalidEmailError,
  PasswordWithoutDigitsError,
  PasswordWithoutUppercaseError
} from "validations-fiuba-laboral-v2";
import { DniGenerator } from "$generators/DNI";
import { UserGenerator } from "$generators/User";

describe("UserRepository", () => {
  beforeEach(() => UserRepository.truncate());

  describe("create", () => {
    it("creates a user", async () => {
      const userAttributes = {
        email: "asd@qwe.com",
        password: "AValidPassword123",
        name: "Sebastian",
        surname: "Blanco"
      };
      const user = await UserRepository.create(userAttributes);

      expect(user).toEqual(
        expect.objectContaining({
          uuid: expect.stringMatching(UUID_REGEX),
          email: userAttributes.email,
          name: userAttributes.name,
          surname: userAttributes.surname
        })
      );
    });

    it("creates a user with no password", async () => {
      const user = await UserRepository.create({
        email: "asd@qwe.com",
        dni: DniGenerator.generate(),
        name: "Sebastian",
        surname: "Blanco"
      });
      expect(user.password).toBeNull();
    });

    it("throws an error if password is invalid", async () => {
      await expect(
        UserRepository.create({
          email: "asd@qwe.com",
          password: "an invalid password",
          name: "Sebastian",
          surname: "blanco"
        })
      ).rejects.toThrowErrorWithMessage(
        PasswordWithoutUppercaseError,
        "La contraseña debe contener letras mayúsculas"
      );
    });

    it("throws error if email has invalid format", async () => {
      await expect(
        UserRepository.create({
          email: "asd@qwecom",
          password: "AValidPassword123",
          name: "Sebastian",
          surname: "blanco"
        })
      ).rejects.toThrowErrorWithMessage(
        ValidationError,
        InvalidEmailError.buildMessage("asd@qwecom")
      );
    });

    it("throws an error when creating an user with an existing email", async () => {
      const email = "asd@qwe.com";
      await UserRepository.create({
        email: email,
        password: "somethingVerySecret123",
        name: "name",
        surname: "surname"
      });
      await expect(
        UserRepository.create({
          email: email,
          password: "somethingVerySecret123",
          name: "name",
          surname: "surname"
        })
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });

    it("throws an error when creating an user with an existing dni", async () => {
      const dni = "39207888";
      await UserRepository.create({
        email: "robert_johnson@gmail.com",
        password: "somethingVerySecret123",
        name: "Robert",
        dni,
        surname: "Johnson"
      });
      await expect(
        UserRepository.create({
          email: "eddie_boyd@gmail.com",
          password: "somethingVerySecret123",
          name: "Eddie",
          dni,
          surname: "Boyd"
        })
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });

    it("throws an error if the password has no digits", async () => {
      await expect(
        UserRepository.create({
          email: "asd@qwe.com",
          password: "somethingWithoutDigits",
          name: "name",
          surname: "surname"
        })
      ).rejects.toThrowErrorWithMessage(
        PasswordWithoutDigitsError,
        "La contraseña debe contener numeros"
      );
    });

    describe("createFiubaUser", () => {
      it("creates a valid Fiuba user", async () => {
        const attributes = {
          email: "email@gmail.com",
          dni: DniGenerator.generate(),
          password: "somethingVerySecret123",
          name: "name",
          surname: "surname"
        };
        const user = await UserRepository.createFiubaUser(attributes);
        expect(user).toEqual(
          expect.objectContaining({
            uuid: expect.stringMatching(UUID_REGEX),
            ...attributes,
            password: null
          })
        );
      });

      it("throws an error if the FiubaService authentication returns false", async () => {
        const fiubaUsersServiceMock = jest.spyOn(FiubaUsersService, "authenticate");
        fiubaUsersServiceMock.mockResolvedValueOnce(Promise.resolve(false));
        const dni = "39207888";
        await expect(
          UserRepository.createFiubaUser({
            email: "email@gmail.com",
            dni,
            password: "somethingVerySecret123",
            name: "name",
            surname: "surname"
          })
        ).rejects.toThrowErrorWithMessage(
          FiubaUserNotFoundError,
          FiubaUserNotFoundError.buildMessage(dni)
        );
      });

      it("throws an error if dni is empty", async () => {
        await expect(
          UserRepository.createFiubaUser({
            dni: "",
            email: "email@gmail.com",
            password: "somethingVerySecret123",
            name: "name",
            surname: "surname"
          })
        ).rejects.toThrowErrorWithMessage(
          InvalidEmptyUsernameError,
          InvalidEmptyUsernameError.buildMessage()
        );
      });
    });
  });

  describe("findByEmail", () => {
    it("finds a user by email", async () => {
      await UserGenerator.instance();
      const user = await UserGenerator.instance();
      const foundUser = await UserRepository.findByEmail(user.email);

      expect(foundUser.email).toEqual(user.email);
      expect(foundUser.password).toEqual(user.password);
    });

    it("returns error when it does not find a user with the given email", async () => {
      await UserGenerator.instance();
      await UserGenerator.instance();
      const nonExistentEmail = "yyy@yyy.com";
      await expect(UserRepository.findByEmail(nonExistentEmail)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ email: nonExistentEmail })
      );
    });
  });

  describe("findByUuids", () => {
    it("finds users by the given uuids", async () => {
      const uuids = [
        await UserGenerator.instance(),
        await UserGenerator.instance(),
        await UserGenerator.instance()
      ].map(({ uuid }) => uuid);

      const users = await UserRepository.findByUuids(uuids);
      expect(users).toHaveLength(uuids.length);
      expect(users.map(({ uuid }) => uuid)).toEqual(expect.arrayContaining(uuids));
    });

    it("returns an empty array if the given uuids do not belong to a persisted user", async () => {
      const uuids = [UUID.generate(), UUID.generate(), UUID.generate(), UUID.generate()];

      const users = await UserRepository.findByUuids(uuids);
      expect(users).toEqual([]);
    });

    it("finds only the users with an uuid persisted", async () => {
      const persistedUuids = [await UserGenerator.instance()].map(({ uuid }) => uuid);
      const nonPersistedUuids = [UUID.generate()];

      const users = await UserRepository.findByUuids([...persistedUuids, ...nonPersistedUuids]);
      expect(users).toHaveLength(persistedUuids.length);
      expect(users.map(({ uuid }) => uuid)).toEqual(expect.arrayContaining(persistedUuids));
    });
  });

  describe("findByDni", () => {
    it("finds a user by dni", async () => {
      const dni = "1234567";
      await UserGenerator.instance();
      const user = await UserGenerator.instance({ dni });
      const foundUser = await UserRepository.findByDni(user.dni);

      expect(foundUser.dni).toEqual(dni);
      expect(foundUser.email).toEqual(user.email);
      expect(foundUser.password).toEqual(user.password);
    });

    it("returns error when it does not find a user with the given dni", async () => {
      await UserGenerator.instance();
      await UserGenerator.instance();
      const nonExistentDni = "1234567";
      await expect(UserRepository.findByDni(nonExistentDni)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ dni: nonExistentDni })
      );
    });
  });

  describe("findByUuid", () => {
    it("returns user by uuid", async () => {
      await UserGenerator.instance();
      const secondUser = await UserGenerator.instance();
      await UserGenerator.instance();
      const user = await UserRepository.findByUuid(secondUser.uuid);
      expect(user.toJSON()).toEqual(secondUser.toJSON());
    });

    it("throws an error if the user with the given uuid is not found", async () => {
      await UserGenerator.instance();
      await UserGenerator.instance();
      await UserGenerator.instance();
      const nonExistentUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(UserRepository.findByUuid(nonExistentUuid)).rejects.toThrowErrorWithMessage(
        UserNotFoundError,
        UserNotFoundError.buildMessage({ uuid: nonExistentUuid })
      );
    });
  });
});
