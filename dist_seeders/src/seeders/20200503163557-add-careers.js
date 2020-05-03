"use strict";
module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert("Careers", [
            {
                code: "10",
                description: "Ingeniería Informática",
                credits: 248,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },
    down: (queryInterface) => {
        return queryInterface.bulkDelete("Careers", {}, {});
    }
};
