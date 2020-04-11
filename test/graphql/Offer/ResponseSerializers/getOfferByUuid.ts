import { Offer } from "../../../../src/models/Offer";
import { GraphQLResponse } from "../../ResponseSerializers";

const getOfferByUuid = async (offer: Offer) => {
    const careers = await offer.getCareers();
    const company = await offer.getCompany();
    const sections = await offer.getSections();
    return {
        uuid: offer.uuid,
        title: offer.title,
        description: offer.description,
        hoursPerDay: offer.hoursPerDay,
        minimumSalary: offer.minimumSalary,
        maximumSalary: offer.maximumSalary,
        createdAt: offer.createdAt.getTime().toString(),
        careers: careers.map(career => GraphQLResponse.career.getCareerByCode(career)),
        company: await GraphQLResponse.company.getCompanyById(company),
        sections: sections.map(section => GraphQLResponse.offer.getOfferSections(section))
    };
};

export { getOfferByUuid };
