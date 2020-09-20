export const BusinessNameGenerator = {
  index: 0,
  getIndex: () => {
    BusinessNameGenerator.index += 1;
    return BusinessNameGenerator.index;
  },
  generate: () => `El zorro S.A ${BusinessNameGenerator.getIndex()}`
};
