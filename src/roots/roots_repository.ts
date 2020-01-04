import Roots from "./roots";

export default class RootsRepository {
  public static findById(id: string) {
      return Roots.findOne({ where: { id: id } });
  }

  public static findAll() {
    return Roots.findAll({});
  }

  public static create(record: object) {
    return Roots.create(record);
  }

  public static truncate() {
    return Roots.destroy({ truncate: true });
  }
}
