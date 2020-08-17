import { withMinimumData } from "./withMinimumData";
import { ICompanyGeneratorAttributes } from "$generators/interfaces";

export const completeData = ({ index, photos, user }: IWithCompleteData) => ({
  ...withMinimumData({ index, user }),
  slogan: "Lo mejor está llegando",
  description: "description",
  logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA AgICAgICAgICAgICAgIA==",
  website: "https://jobs.mercadolibre.com/",
  email: "jobs@mercadolibre.com",
  phoneNumbers: ["1143076222", "1159821999", "1143336666", "1143337777"],
  photos: photos || []
});

interface IWithCompleteData extends ICompanyGeneratorAttributes {
  index: number;
}
