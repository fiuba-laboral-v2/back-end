import { UserSequelizeModel } from "$models";
import { NameWhereClause } from "$models/QueryBuilder";
import { Includeable } from "sequelize/types/lib/model";

export const UsersWhereClauseBuilder = {
  build: ({ name }: IBuild): Includeable | undefined => {
    if (name === undefined) return;
    const whereClause = NameWhereClause.build({ name, columnNames: ["name", "surname"] });
    if (!whereClause) return;
    return { model: UserSequelizeModel, where: whereClause, attributes: [] };
  }
};

interface IBuild {
  name?: string;
}
