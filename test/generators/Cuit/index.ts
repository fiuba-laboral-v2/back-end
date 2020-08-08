import { DniGenerator } from "$generators/DNI";

export const CuitGenerator = {
  generate: () => {
    const middleNumbers = DniGenerator.generateDigitArray();
    const numbers = [2, 0, ...middleNumbers];
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let aux = 0;
    multipliers.forEach((value, index) => aux += value * numbers[index]);

    const rest: number = aux % 11;
    let last = 11 - rest;
    if (last === 11) last = 0;
    if (last === 10) last = 9;
    const cuit = [...numbers, last];
    return cuit.join("");
  }
};
