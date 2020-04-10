import { DATE, UUID, QueryInterface, STRING } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        "OffersCareers",
        {
          careerCode: {
            allowNull: false,
            references: { model: "Careers", key: "code" },
            onDelete: "CASCADE",
            type: STRING
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
      await queryInterface.addConstraint(
        "OffersCareers",
        ["careerCode", "offerUuid"],
        {
          type: "primary key",
          name: "OffersSections_careerCode_offerUuid_key",
          transaction
        }
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("OffersCareers");
  }
};
