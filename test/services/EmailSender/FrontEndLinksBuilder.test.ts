import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";

describe("FrontEndLinksBuilder", () => {
  it("builds the offer link for a company", () => {
    const link = FrontEndLinksBuilder.company.offerLink("uuid");
    expect(link).toEqual("baseUrl/subDomain/empresa/ofertas/uuid");
  });

  it("builds the applicant link for a company", () => {
    const link = FrontEndLinksBuilder.company.applicantLink("uuid");
    expect(link).toEqual("baseUrl/subDomain/empresa/postulantes/uuid");
  });

  it("builds the profile link for an applicant", () => {
    const link = FrontEndLinksBuilder.applicant.profileLink();
    expect(link).toEqual("baseUrl/subDomain/postulante/perfil");
  });

  it("builds the offer link for an applicant", () => {
    const link = FrontEndLinksBuilder.applicant.offerLink("uuid");
    expect(link).toEqual("baseUrl/subDomain/postulante/ofertas/uuid");
  });
});
