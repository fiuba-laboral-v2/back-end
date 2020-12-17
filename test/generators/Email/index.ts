export const EmailGenerator = {
  index: 0,
  getIndex: () => {
    EmailGenerator.index += 1;
    return EmailGenerator.index;
  },
  generate: () => `randomEmail${EmailGenerator.getIndex()}@fi.uba.ar`
};
