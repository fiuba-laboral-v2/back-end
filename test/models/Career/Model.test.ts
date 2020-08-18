import { ValidationError } from "sequelize";
import { Career } from "$models";

describe("Career", () => {
  const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
    const attributes = { code: "1", description: "descripton" };
    delete attributes[attribute];
    const career: Career = new Career(attributes);
    await expect(career.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: Career.${attribute} cannot be null`
    );
  };

  it("creates a valid career", async () => {
    const career = new Career({
      code: "10",
      description: "Ingeniería Informática"
    });

    await expect(career.validate()).resolves.not.toThrow();
  });

  it("creates a career with the given attributes", async () => {
    const attributes = {
      code: "10",
      description: "Ingeniería Informática"
    };
    const career = new Career(attributes);

    expect(career).toEqual(expect.objectContaining(attributes));
  });

  it("throws an error if no code is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("code");
  });

  it("throws an error if no description is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("description");
  });
});
