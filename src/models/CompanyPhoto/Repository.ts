import { Transaction } from "sequelize";
import { Company, CompanyPhoto } from "$models";
import { uniq } from "lodash";

export const CompanyPhotoRepository = {
  update: async (photos: string[] = [], company: Company, transaction?: Transaction) => {
    await CompanyPhoto.destroy({ where: { companyUuid: company.uuid }, transaction });
    return CompanyPhoto.bulkCreate(
      uniq(photos).map(photo => ({ photo, companyUuid: company.uuid })),
      { transaction, validate: true }
    );
  },
  truncate: async () => CompanyPhoto.destroy({ truncate: true })
};
