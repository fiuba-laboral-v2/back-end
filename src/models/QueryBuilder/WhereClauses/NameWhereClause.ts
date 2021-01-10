import { col, fn, Op, where } from "sequelize";
import { WhereOptions } from "sequelize/types/lib/model";

const removeAccent = word => word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const normalize = word => removeAccent(word).toLowerCase();
const splitName = name =>
  name
    .replace(/\n/g, " ")
    .split(" ")
    .filter(word => word !== "");

export const NameWhereClause = {
  build: ({ name, columnNames }: IBuild): WhereOptions | undefined => {
    if (columnNames.length === 0) return;
    const words = splitName(name);
    if (words.length === 0) return;
    return {
      [Op.and]: words.map(word => ({
        [Op.or]: columnNames.map(columnName =>
          where(fn("unaccent", fn("lower", col(columnName))), {
            [Op.regexp]: `(^|[[:space:]])${normalize(word)}([[:space:]]|$)`
          })
        )
      }))
    };
  }
};

interface IBuild {
  name: string;
  columnNames: string[];
}
