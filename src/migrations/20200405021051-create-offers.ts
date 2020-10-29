import { QueryInterface, DATE, UUID, TEXT, INTEGER, BOOLEAN } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Offers", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID
      },
      companyUuid: {
        allowNull: false,
        references: { model: "Companies", key: "uuid" },
        onDelete: "CASCADE",
        type: UUID
      },
      title: {
        allowNull: false,
        type: TEXT
      },
      description: {
        allowNull: false,
        type: TEXT
      },
      hoursPerDay: {
        allowNull: false,
        type: INTEGER
      },
      isInternship: {
        allowNull: false,
        type: BOOLEAN
      },
      minimumSalary: {
        allowNull: false,
        type: INTEGER
      },
      maximumSalary: {
        allowNull: true,
        type: INTEGER
      },
      extensionApprovalStatus: {
        allowNull: false,
        type: "approval_status",
        defaultValue: "pending"
      },
      graduadosApprovalStatus: {
        allowNull: false,
        type: "approval_status",
        defaultValue: "pending"
      },
      targetApplicantType: {
        allowNull: false,
        type: "applicant_type"
      },
      graduatesExpirationDateTime: {
        allowNull: true,
        type: DATE
      },
      studentsExpirationDateTime: {
        allowNull: true,
        type: DATE
      },
      createdAt: {
        allowNull: false,
        type: DATE
      },
      updatedAt: {
        allowNull: false,
        type: DATE
      }
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Offers");
  }
};
