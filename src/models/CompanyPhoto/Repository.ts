import { Transaction } from "sequelize";
import { Company, CompanyPhoto } from "..";

export const CompanyPhotoRepository = {
  bulkCreate: (photos: string[] = [], company: Company, transaction?: Transaction) => {
    return CompanyPhoto.bulkCreate(
      photos.map(photo => ({ photo, companyUuid: company.uuid })),
      {
        transaction,
        validate: true
      }
    );
  },
  truncate: async () => {
    return CompanyPhoto.destroy({ truncate: true });
  }
};
