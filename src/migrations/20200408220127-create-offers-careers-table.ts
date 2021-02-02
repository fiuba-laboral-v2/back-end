import { DATE, UUID, QueryInterface, TEXT } from "sequelize";

const TABLE_NAME = "OffersCareers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          careerCode: {
            allowNull: false,
            references: { model: "Careers", key: "code" },
            onDelete: "CASCADE",
            type: TEXT
          },
          offerUuid: {
            allowNull: false,
            references: { model: "Offers", key: "uuid" },
            onDelete: "CASCADE",
            type: UUID
          },
          createdAt: {
            allowNull: false,
            type: DATE
          },
          updatedAt: {
            allowNull: false,
            type: DATE
          }
        },
        { transaction }
      );
      await queryInterface.addConstraint(TABLE_NAME, ["offerUuid", "careerCode"], {
        type: "primary key",
        name: "OffersCareers_offerUuid_careerCode_key",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
