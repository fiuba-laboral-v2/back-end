import { SecretaryEnumValues } from "$models/Admin/Interface";

export const isSecretary = {
  validate: {
    isIn: {
      msg: `Secretary must be one of these values: ${SecretaryEnumValues}`,
      args: [SecretaryEnumValues],
    },
  },
};
