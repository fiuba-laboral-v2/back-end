import { UserSequelizeModel } from "$models";
import { NameWhereClause } from "$models/QueryBuilder";

export const UsersWhereClauseBuilder = {
  build: ({ name }: IBuild) => {
    if (name === undefined) return;
    const whereClause = NameWhereClause.build({ name, columnNames: ["name", "surname"] });
    if (!whereClause) return;
    return { model: UserSequelizeModel, where: whereClause, attributes: [] };
  }
};

interface IBuild {
  name?: string;
}
