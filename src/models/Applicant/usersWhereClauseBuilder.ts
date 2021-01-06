import { UserSequelizeModel } from "$models";
import { col, fn, Op, where } from "sequelize";
import { Includeable } from "sequelize/types/lib/model";

export const usersWhereClauseBuilder = {
  build: ({ name }: IBuild): Includeable | undefined => {
    if (name === undefined) return;
    const removeAccent = word => word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalize = word => removeAccent(word).toLowerCase();
    const words = name
      .replace("\n", " ")
      .split(" ")
      .filter(word => word !== "");
    if (words.length === 0) return;
    return {
      model: UserSequelizeModel,
      where: {
        [Op.and]: words.map(word => ({
          [Op.or]: [
            where(fn("unaccent", fn("lower", col("name"))), {
              [Op.regexp]: `(^|[[:space:]])${normalize(word)}([[:space:]]|$)`
            }),
            where(fn("unaccent", fn("lower", col("surname"))), {
              [Op.regexp]: `(^|[[:space:]])${normalize(word)}([[:space:]]|$)`
            })
          ]
        }))
      },
      attributes: []
    };
  }
};

interface IBuild {
  name?: string;
}
