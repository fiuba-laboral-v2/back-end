import { QueryInterface } from "sequelize";
import { uuids } from "./constants/uuids";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Capabilities",
      [
        {
          uuid: uuids.capabilities.node,
          description: "Node",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.RoR,
          description: "RoR",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.typescript,
          description: "Typescript",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.python,
          description: "Python",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.go,
          description: "Go",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.c,
          description: "C",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.cPlusPlus,
          description: "C++",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.java,
          description: "Java",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.postgres,
          description: "Postgres",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.mongo,
          description: "mongo",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.cassandra,
          description: "Cassandra",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.sql,
          description: "SQL",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.capabilities.noSQL,
          description: "NoSQL",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Capabilities", {});
  }
};
