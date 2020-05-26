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
  update: async (photos: string[] = [], company: Company, transaction?: Transaction) => {
    if (!photos || photos.length === 0) return;

    await CompanyPhoto.destroy({
      where: { companyUuid: company.uuid },
      transaction
    });
    return CompanyPhotoRepository.bulkCreate(photos, company, transaction);
  },
  truncate: async () => {
    return CompanyPhoto.destroy({ truncate: true });
  }
};
