import { Root } from "./index";

export const RootsRepository = {
  findById: async (id: string) => {
    return Root.findOne({ where: { id: id } });
  },
  findAll: async () => {
    return Root.findAll({});
  },
  save: async (root: Root) => {
    return root.save();
  },
  truncate: async () => {
    return Root.destroy({ truncate: true });
  }
};
