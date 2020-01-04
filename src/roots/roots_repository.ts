import Roots from "./roots";

export const RootsRepository = {
  findById: async (id: string) => {
    try {
      return await Roots.findOne({where: {id: id}});
    } catch (exception) {
      throw exception;
    }
  },
  findAll: async () => {
    try {
      return await Roots.findAll({});
    } catch (exception) {
      throw exception;
    }
  },
  create: async (record: object) => {
    try {
      return await Roots.create(record);
    } catch (exception) {
      throw exception;
    }
  },
  truncate: async () => {
    try {
      return await Roots.destroy({truncate: true});
    } catch (exception) {
      throw exception;
    }
  }
};
