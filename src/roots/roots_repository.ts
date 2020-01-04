import Roots from "./roots";

export default class RootsRepository {
  public static async findById(id: string) {
      try {
        return await Roots.findOne({ where: { id: id } });
      } catch (e) {
        throw new Error(e.message);
      }
  }

  public static async findAll() {
    try {
      return await Roots.findAll({});
    } catch (e) {
      throw new Error(e.message);
    }
  }

  public static async create(record: object) {
    try {
      return await Roots.create(record);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  public static async truncate() {
    try {
      return await Roots.destroy({ truncate: true });
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
