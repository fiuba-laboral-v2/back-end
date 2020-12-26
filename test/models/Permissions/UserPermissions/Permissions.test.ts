import { UserPermissions } from "$models/Permissions";
import { AdminRole, ApplicantRole, CompanyRole, CurrentUser } from "$models/CurrentUser";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";
import { CareerRepository } from "$models/Career";
import { Secretary } from "$models/Admin";
import { Admin, Applicant, Company } from "$models";
import { IForAllTargets, OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { UserGenerator } from "$generators/User";
import { CareerGenerator } from "$generators/Career";
import { ApplicantType } from "$models/Applicant";

describe("UserPermissions", () => {
  let companyUuid: string;
  let company: Company;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    company = await CompanyGenerator.instance.withMinimumData();
    companyUuid = company.uuid;
  });

  describe("canSeeOffer", () => {
    describe("when the current user is an applicant", () => {
      it("returns true if the offer is for students and the applicant is a student", async () => {
        const offer = await OfferGenerator.instance.forStudents({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.student();
        const currentUser = new CurrentUser({
          uuid: userUuid,
          email: "email@email.com",
          roles: [new ApplicantRole(uuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns true if the offer is for students and the applicant is both", async () => {
        const offer = await OfferGenerator.instance.forStudents({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.studentAndGraduate();
        const currentUser = new CurrentUser({
          uuid: userUuid,
          email: "email@email.com",
          roles: [new ApplicantRole(uuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns true if the offer is for graduates and the applicant is a graduate", async () => {
        const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.graduate();
        const currentUser = new CurrentUser({
          uuid: userUuid,
          email: "email@email.com",
          roles: [new ApplicantRole(uuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns true if the offer is for both and the applicant is both", async () => {
        const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.studentAndGraduate();
        const currentUser = new CurrentUser({
          uuid: userUuid,
          email: "email@email.com",
          roles: [new ApplicantRole(uuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns false if the offer is for students and the applicant is a graduate", async () => {
        const offer = await OfferGenerator.instance.forStudents({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.graduate();
        const currentUser = new CurrentUser({
          uuid: userUuid,
          email: "email@email.com",
          roles: [new ApplicantRole(uuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(false);
      });

      it("returns false if the offer is for graduates and the applicant is a student", async () => {
        const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const { uuid, userUuid } = await ApplicantGenerator.instance.student();
        const currentUser = new CurrentUser({
          uuid: userUuid,
          email: "email@email.com",
          roles: [new ApplicantRole(uuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(false);
      });
    });

    describe("when the current user is from a company", () => {
      it("returns true if the offer belongs to the company", async () => {
        const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const [user] = await company.getUsers();
        const currentUser = new CurrentUser({
          uuid: user.uuid!,
          email: "email@email.com",
          roles: [new CompanyRole(companyUuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(true);
      });

      it("returns false if the offer does not belongs to the company", async () => {
        const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const anotherCompany = await CompanyGenerator.instance.withCompleteData();
        const [user] = await anotherCompany.getUsers();
        const currentUser = new CurrentUser({
          uuid: user.uuid!,
          email: "email@email.com",
          roles: [new CompanyRole(anotherCompany.uuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(offer)).toBe(false);
      });
    });

    describe("when the current user is and admin", () => {
      it("returns true for any offer from any company", async () => {
        const { uuid } = await CompanyGenerator.instance.withCompleteData();
        const firstOffer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const secondOffer = await OfferGenerator.instance.forGraduates({ companyUuid });
        const thirdOffer = await OfferGenerator.instance.forGraduates({ companyUuid: uuid });
        const fourthOffer = await OfferGenerator.instance.forGraduates({ companyUuid: uuid });
        const { userUuid } = await AdminGenerator.graduados();
        const currentUser = new CurrentUser({
          uuid: userUuid,
          email: "email@email.com",
          roles: [new AdminRole(userUuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(firstOffer)).toBe(true);
        expect(await permissions.canSeeOffer(secondOffer)).toBe(true);
        expect(await permissions.canSeeOffer(thirdOffer)).toBe(true);
        expect(await permissions.canSeeOffer(fourthOffer)).toBe(true);
      });
    });

    describe("when the current user is an admin and an applicant", () => {
      it("returns true for any offer from any company", async () => {
        const { uuid } = await CompanyGenerator.instance.withCompleteData();
        const firstOffer = await OfferGenerator.instance.forStudents({ companyUuid });
        const thirdOffer = await OfferGenerator.instance.forStudents({ companyUuid: uuid });

        const { code: careerCode } = await CareerGenerator.instance();
        const user = await UserGenerator.instance();
        const applicant = await Applicant.create({ userUuid: user.uuid, padron: 98533 });
        await ApplicantCareersRepository.bulkCreate([{ careerCode, isGraduate: true }], applicant);
        const admin = await Admin.create({ userUuid: user.uuid, secretary: Secretary.extension });
        const currentUser = new CurrentUser({
          uuid: user.uuid!,
          email: "email@email.com",
          roles: [new AdminRole(admin.userUuid), new ApplicantRole(applicant.uuid)]
        });
        const permissions = new UserPermissions(currentUser);
        expect(await permissions.canSeeOffer(firstOffer)).toBe(true);
        expect(await permissions.canSeeOffer(thirdOffer)).toBe(true);
      });
    });
  });

  describe("canModerateOffer", () => {
    let offers: IForAllTargets;
    let student: Applicant;
    let graduate: Applicant;
    let studentAndGraduate: Applicant;

    beforeAll(async () => {
      offers = await OfferGenerator.instance.forAllTargets({ companyUuid });

      student = await ApplicantGenerator.instance.student();
      graduate = await ApplicantGenerator.instance.graduate();
      studentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate();
    });

    describe("when the current user is an admin", () => {
      let currentGraduadosAdminUser: CurrentUser;
      let currentExtensionAdminUser: CurrentUser;

      beforeAll(async () => {
        const { userUuid: graduadosUserUuid } = await AdminGenerator.graduados();
        currentGraduadosAdminUser = new CurrentUser({
          uuid: graduadosUserUuid,
          email: "graduados@admin.com",
          roles: [new AdminRole(graduadosUserUuid)]
        });

        const { userUuid: extensionUserUuid } = await AdminGenerator.extension();
        currentExtensionAdminUser = new CurrentUser({
          uuid: extensionUserUuid,
          email: "extension@admin.com",
          roles: [new AdminRole(extensionUserUuid)]
        });
      });

      it("returns true if the offer is for students and the admin from extension", async () => {
        const permissions = currentExtensionAdminUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.student])).toBe(true);
      });

      it("returns false if the offer is for graduates and the admin from extension", async () => {
        const permissions = currentExtensionAdminUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.graduate])).toBe(false);
      });

      it("returns true if the offer is for both and the admin from extension", async () => {
        const permissions = currentExtensionAdminUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.both])).toBe(true);
      });

      it("returns false if the offer is for students and the admin from graduados", async () => {
        const permissions = currentGraduadosAdminUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.student])).toBe(false);
      });

      it("returns true if the offer is for graduates and the admin from graduados", async () => {
        const permissions = currentGraduadosAdminUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.graduate])).toBe(true);
      });

      it("returns true if the offer is for both and the admin from graduados", async () => {
        const permissions = currentGraduadosAdminUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.both])).toBe(true);
      });
    });

    describe("when the current user is an applicant", () => {
      let currentStudent: CurrentUser;
      let currentGraduate: CurrentUser;
      let currentStudentAndGraduate: CurrentUser;

      beforeAll(async () => {
        currentStudent = new CurrentUser({
          uuid: student.userUuid,
          email: "student@applicant.com",
          roles: [new ApplicantRole(student.uuid)]
        });

        currentGraduate = new CurrentUser({
          uuid: graduate.userUuid,
          email: "graduate@applicant.com",
          roles: [new ApplicantRole(graduate.uuid)]
        });

        currentStudentAndGraduate = new CurrentUser({
          uuid: studentAndGraduate.userUuid,
          email: "studentAndGraduate@applicant.com",
          roles: [new ApplicantRole(studentAndGraduate.uuid)]
        });
      });

      it("does not allow a student to moderate offer for students", async () => {
        const permissions = currentStudent.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.student])).toBe(false);
      });

      it("does not allow a student to moderate offer for graduates", async () => {
        const permissions = currentStudent.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.graduate])).toBe(false);
      });

      it("does not allow a student to moderate offer for both", async () => {
        const permissions = currentStudent.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.both])).toBe(false);
      });

      it("does not allow a graduate to moderate offer for students", async () => {
        const permissions = currentGraduate.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.student])).toBe(false);
      });

      it("does not allow a graduate to moderate offer for graduates", async () => {
        const permissions = currentGraduate.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.graduate])).toBe(false);
      });

      it("does not allow a graduate to moderate offer for both", async () => {
        const permissions = currentGraduate.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.both])).toBe(false);
      });

      it("does not allow a student and graduate to moderate offer for students", async () => {
        const permissions = currentStudentAndGraduate.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.student])).toBe(false);
      });

      it("does not allow a student and graduate to moderate offer for graduates", async () => {
        const permissions = currentStudentAndGraduate.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.graduate])).toBe(false);
      });

      it("does not allow a student and graduate to moderate offer for both", async () => {
        const permissions = currentStudentAndGraduate.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.both])).toBe(false);
      });
    });

    describe("when the current user is from a company", () => {
      let currentCompanyUser: CurrentUser;
      let anotherCompany: Company;

      beforeAll(async () => {
        const [user] = await company.getUsers();
        currentCompanyUser = new CurrentUser({
          uuid: user.uuid!,
          email: "company@mail.com",
          roles: [new CompanyRole(company.uuid)]
        });

        anotherCompany = await CompanyGenerator.instance.withCompleteData();
      });

      it("does not allow a company to moderate its offer for students", async () => {
        const permissions = currentCompanyUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.student])).toBe(false);
      });

      it("does not allow a company to moderate its offer for graduates", async () => {
        const permissions = currentCompanyUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.graduate])).toBe(false);
      });

      it("does not allow a company to moderate its offer for both", async () => {
        const permissions = currentCompanyUser.getPermissions();
        expect(await permissions.canModerateOffer(offers[ApplicantType.both])).toBe(false);
      });

      it("does not allow a company to moderate an offer for students", async () => {
        const permissions = currentCompanyUser.getPermissions();
        const offer = await OfferGenerator.instance.forStudents({
          companyUuid: anotherCompany.uuid
        });
        expect(await permissions.canModerateOffer(offer)).toBe(false);
      });

      it("does not allow a company to moderate an offer for graduates", async () => {
        const permissions = currentCompanyUser.getPermissions();
        const offer = await OfferGenerator.instance.forGraduates({
          companyUuid: anotherCompany.uuid
        });
        expect(await permissions.canModerateOffer(offer)).toBe(false);
      });

      it("does not allow a company to moderate an offer for both", async () => {
        const permissions = currentCompanyUser.getPermissions();
        const offer = await OfferGenerator.instance.forStudentsAndGraduates({
          companyUuid: anotherCompany.uuid
        });
        expect(await permissions.canModerateOffer(offer)).toBe(false);
      });
    });
  });
});
