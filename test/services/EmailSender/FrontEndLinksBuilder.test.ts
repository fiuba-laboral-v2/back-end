import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";

describe("FrontEndLinksBuilder", () => {
  it("builds the password recovery link for a company", () => {
    const link = FrontEndLinksBuilder.company.editMyForgottenPassword("token");
    expect(link).toEqual("baseUrl/subDomain/empresa/contrasena/recuperar/?token=token");
  });

  it("builds the offer link for a company", () => {
    const link = FrontEndLinksBuilder.company.offerLink("uuid");
    expect(link).toEqual("baseUrl/subDomain/empresa/ofertas/uuid");
  });

  it("builds the applicant link for a company", () => {
    const link = FrontEndLinksBuilder.company.applicantLink("uuid");
    expect(link).toEqual("baseUrl/subDomain/empresa/postulantes/uuid");
  });

  it("builds the profile link for a company", () => {
    const link = FrontEndLinksBuilder.company.profileLink();
    expect(link).toEqual("baseUrl/subDomain/empresa/perfil");
  });

  it("builds the profile link for an applicant", () => {
    const link = FrontEndLinksBuilder.applicant.profileLink();
    expect(link).toEqual("baseUrl/subDomain/postulante/perfil");
  });

  it("builds the offer link for an applicant", () => {
    const link = FrontEndLinksBuilder.applicant.offerLink("uuid");
    expect(link).toEqual("baseUrl/subDomain/postulante/ofertas/uuid");
  });

  it("builds the company profile link for an admin", () => {
    const link = FrontEndLinksBuilder.admin.company.profileLink("uuid");
    expect(link).toEqual("baseUrl/subDomain/admin/empresas/uuid");
  });
});
