import { withMinimumData } from "./withMinimumData";

export const completeData = (index: number) => {
  return {
    ...withMinimumData(index),
    slogan: "Lo mejor está llegando",
    description: "description",
    logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA AgICAgICAgICAgICAgIA==",
    website: "https://jobs.mercadolibre.com/",
    email: "jobs@mercadolibre.com",
    phoneNumbers: ["1143076222", "1159821999", "1143336666", "1143337777"],
    photos: [
      "https://miro.medium.com/max/11520/1*Om-snCmpOoI5vehnF6FBlw.jpeg",
      "https://pbs.twimg.com/media/EK_OWQEWwAIwDXr.jpg"
    ]
  };
};
