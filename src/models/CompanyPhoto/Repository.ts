import { CompanyPhoto } from "./index";

export const CompanyPhotoRepository = {
  build: (photos: string[] = []) => {
    const companyPhotos: CompanyPhoto[] = [];
    for (const photo of  photos) {
      companyPhotos.push(new CompanyPhoto({ photo: photo }));
    }
    return companyPhotos;
  },
  truncate: async () => {
    return CompanyPhoto.destroy({ truncate: true });
  }
};
