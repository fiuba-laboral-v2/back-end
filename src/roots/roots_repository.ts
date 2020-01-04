import Roots from "./roots";

export const RootsRepository = {
  findById: async (id: string) => {
    return Roots.findOne({where: {id: id}});
  },
  findAll: async () => {
    return Roots.findAll({});
  },
  create: async (root: Roots) => {
    return root.save();
  },
  truncate: async () => {
    return Roots.destroy({truncate: true});
  }
};
