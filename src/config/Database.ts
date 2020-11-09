import { Sequelize } from "sequelize-typescript";
import { Environment } from "./Environment";
import databaseJSON from "../../config/database.json";
import { QueryOptions, Transaction } from "sequelize";
import {
  Admin,
  Applicant,
  ApplicantApprovalEvent,
  ApplicantCapability,
  ApplicantCareer,
  ApplicantLink,
  ApplicantExperienceSection,
  Capability,
  Career,
  Company,
  CompanyApprovalEvent,
  CompanyPhoneNumber,
  CompanyPhoto,
  CompanyUser,
  JobApplication,
  JobApplicationApprovalEvent,
  Offer,
  OfferCareer,
  OfferSection,
  OfferApprovalEvent,
  ApplicantKnowledgeSection,
  User,
  Notification,
  SecretarySettings
} from "$models";

const models = [
  Admin,
  Applicant,
  ApplicantApprovalEvent,
  ApplicantKnowledgeSection,
  ApplicantLink,
  ApplicantExperienceSection,
  JobApplication,
  JobApplicationApprovalEvent,
  Career,
  ApplicantCareer,
  Capability,
  ApplicantCapability,
  Company,
  CompanyApprovalEvent,
  CompanyPhoneNumber,
  CompanyPhoto,
  CompanyUser,
  Offer,
  OfferSection,
  OfferCareer,
  OfferApprovalEvent,
  User,
  Notification,
  SecretarySettings
];

export class Database {
  public static sequelize: Sequelize;

  public static close() {
    return this.sequelize?.close();
  }

  public static async transaction<CallbackReturnType>(
    callback: (transaction: Transaction) => Promise<CallbackReturnType>
  ) {
    const transaction = await this.sequelize?.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public static query(sql: string, options: QueryOptions) {
    return this.sequelize?.query(sql, options);
  }

  public static setConnection() {
    const config = databaseJSON[Environment.NODE_ENV];

    if (config.use_env_variable) {
      const url = Environment.databaseURL();
      if (!url) throw new Error("DATABASE_URL not set");
      this.sequelize = new Sequelize(url, config);
    } else {
      this.sequelize = new Sequelize(config.database, config.username, config.password, config);
    }
    this.sequelize.addModels(models);
  }
}
