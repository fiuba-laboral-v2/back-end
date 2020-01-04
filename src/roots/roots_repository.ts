import Roots from "./roots";

export const RootsRepository = {
  findById: async (id: string) => {
      try {
        return await Roots.findOne({ where: { id: id } });
      } catch (e) {
        throw new Error(e.message);
      }
  },
  findAll: async () => {
    try {
      return await Roots.findAll({});
    } catch (e) {
      throw new Error(e.message);
    }
  },
  create: async (record: object) => {
    try {
      return await Roots.create(record);
    } catch (e) {
      throw new Error(e.message);
    }
  },
  truncate: async () => {
    try {
      return await Roots.destroy({ truncate: true });
    } catch (e) {
      throw new Error(e.message);
    }
  }
};
