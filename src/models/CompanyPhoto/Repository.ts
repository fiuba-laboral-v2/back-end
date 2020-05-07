import { Transaction } from "sequelize";
import { CompanyPhoto } from "./index";
import { Company } from "../Company";

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
