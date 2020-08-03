import { SecretaryEnumValues } from "../Admin/Interface";

export const isSecretary = {
  validate: {
    isIn: {
      msg: `Secretary must be one of these values: ${SecretaryEnumValues}`,
      args: [SecretaryEnumValues]
    }
  }
};
