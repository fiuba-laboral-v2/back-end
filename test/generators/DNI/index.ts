export const DniGenerator = {
  index: 0,
  getIndex: () => {
    DniGenerator.index += 1;
    return DniGenerator.index;
  },
  generateDigitArray: () => {
    const randomDni = 11111111 + DniGenerator.getIndex();
    return (`${randomDni}`).split("").map(digit => parseInt(digit, 10));
  },
  generate: () =>
    parseInt(DniGenerator.generateDigitArray().join(""), 10)
};
