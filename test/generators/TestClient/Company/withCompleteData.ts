import { ICompanyAttributes } from "$generators/interfaces";
import { CuitGenerator } from "$generators/Cuit";

export const withCompleteData = (
  {
    index,
    photos,
    user
  }: IWithCompleteData
) => ({
  cuit: CuitGenerator.generate(),
  companyName: "companyName",
  user: {
    email: `companyTestClient${index}@mail.com`,
    password: user?.password || "ASDqfdsfsdfwe234",
    name: "companyTestClientUserName",
    surname: "companyTestClientUserSurname"
  },
  slogan: "Lo mejor está llegando",
  description: "description",
  logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA AgICAgICAgICAgICAgIA==",
  website: "https://jobs.mercadolibre.com/",
  email: "jobs@mercadolibre.com",
  phoneNumbers: ["1143076222", "1159821999", "1143336666", "1143337777"],
  photos: photos || []
});

interface IWithCompleteData extends Omit<ICompanyAttributes, "expressContext" | "status"> {
  index: number;
}
