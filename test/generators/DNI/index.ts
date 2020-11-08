export const DniGenerator = {
  index: 0,
  getIndex: () => {
    DniGenerator.index += 1;
    return DniGenerator.index;
  },
  generateDigitArray: () => {
    const randomDni = 11111111 + DniGenerator.getIndex();
    return `${randomDni}`.split("").map(digit => Number(digit));
  },
  generate: () => `11111111${DniGenerator.getIndex()}`
};
