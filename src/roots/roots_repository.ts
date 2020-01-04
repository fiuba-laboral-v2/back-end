import Roots from "./roots";

export const RootsRepository = {
  findById: async (id: string) => {
      try {
        return await Roots.findOne({ where: { id: id } });
      } catch (e) {
        throw e;
      }
  },
  findAll: async () => {
    try {
      return await Roots.findAll({});
    } catch (e) {
      throw e;
    }
  },
  create: async (record: object) => {
    try {
      return await Roots.create(record);
    } catch (e) {
      throw e;
    }
  },
  truncate: async () => {
    try {
      return await Roots.destroy({ truncate: true });
    } catch (e) {
      throw e;
    }
  }
};
