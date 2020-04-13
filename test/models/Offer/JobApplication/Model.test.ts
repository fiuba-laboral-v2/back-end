import { UniqueConstraintError, ForeignKeyConstraintError, ValidationError } from "sequelize";
import Database from "../../../../src/config/Database";
import { Company } from "../../../../src/models/Company";
import { Applicant } from "../../../../src/models/Applicant";
import { Offer } from "../../../../src/models/Offer";
import { JobApplication } from "../../../../src/models/Offer/JobApplication";
import { companyMockData } from "../../Company/mocks";

describe("JobApplication", () => {
  let company: Company;

  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await Applicant.truncate({ cascade: true });
    await Company.truncate({ cascade: true });
    await Offer.truncate({ cascade: true });
    company = await Company.create(companyMockData);
  });

  afterAll(() => Database.close());

  const applicantData = () => (
    {
      name: "Sebastian",
      surname: "Blanco",
      padron: 98539,
      description: "Developer"
    }
  );

  const offerData = () => {
    return {
      companyId: company.id,
      title: "Java developer senior",
      description: "some description",
      hoursPerDay: 8,
      minimumSalary: 50000,
      maximumSalary: 80000
    };
  };

  const createJobApplication = async () => {
    const { uuid: applicantUuid } = await Applicant.create(applicantData());
    const { uuid: offerUuid } = await Offer.create(offerData());
    return JobApplication.create({ offerUuid: offerUuid, applicantUuid: applicantUuid });
  };

  describe("Valid create", () => {
    it("should create a valid jobApplication", async () => {
      const offer = await Offer.create(offerData());
      const applicant = await Applicant.create(applicantData());
      const jobApplication = new JobApplication({
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid
      });
      await expect(jobApplication.save()).resolves.not.toThrow();
    });

    describe("Associations", () => {
      it("should get Applicant from a jobApplication", async () => {
        const jobApplication = await createJobApplication();
        expect(await jobApplication.getApplicant()).toMatchObject(applicantData());
      });

      it("should get an offer from a jobApplication", async () => {
        const jobApplication = await createJobApplication();
        expect(await jobApplication.getOffer()).toMatchObject(offerData());
      });

      it("should get all applicant's jobApplications", async () => {
        const offer = await Offer.create(offerData());
        const applicant = await Applicant.create(applicantData());
        const jobApplication = await JobApplication.create({
          offerUuid: offer.uuid,
          applicantUuid: applicant.uuid
        });
        expect(
          (await applicant.getJobApplications()).map(aJobApplication => aJobApplication.toJSON())
        ).toEqual(
          expect.arrayContaining([ jobApplication.toJSON() ])
        );
      });
    });
  });

  describe("Errors", () => {
    it("should throw an error if no offerUuid is provided", async () => {
      const applicant = await Applicant.create(applicantData());
      const jobApplication = new JobApplication({
        offerUuid: null,
        applicantUuid: applicant.uuid
      });
      await expect(jobApplication.save()).rejects.toThrow(ValidationError);
    });

    it("should throw an error if no applicantUuid is provided", async () => {
      const { uuid: offerUuid } = await Offer.create(offerData());
      const jobApplication = new JobApplication({
        offerUuid: offerUuid,
        applicantUuid: null
      });
      await expect(jobApplication.save()).rejects.toThrow(ValidationError);
    });

    it("should throw an error if given applicantUuid that does not exist", async () => {
      const { uuid: offerUuid } = await Offer.create(offerData());
      const jobApplication = new JobApplication({
        offerUuid: offerUuid,
        applicantUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
      });
      await expect(jobApplication.save()).rejects.toThrow(ForeignKeyConstraintError);
    });

    it("should throw an error if given offerUuid that does not exist", async () => {
      const { uuid: applicantUuid } = await Applicant.create(applicantData());
      const jobApplication = new JobApplication({
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        applicantUuid: applicantUuid
      });
      await expect(jobApplication.save()).rejects.toThrow(ForeignKeyConstraintError);
    });

    it("should throw an error if offerUuid and applicantUuid exist", async () => {
      const { uuid: applicantUuid } = await Applicant.create(applicantData());
      const { uuid: offerUuid } = await Offer.create(offerData());
      const jobApplicationAttributes = {
        offerUuid: offerUuid,
        applicantUuid: applicantUuid
      };
      await JobApplication.create(jobApplicationAttributes);
      await expect(
        JobApplication.create(jobApplicationAttributes)
      ).rejects.toThrow(UniqueConstraintError);
    });
  });

  describe("Delete cascade", () => {
    it("should delete all jobApplication if all offers are deleted", async () => {
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await Offer.truncate({ cascade: true });
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("should delete all jobApplication if all applicants are deleted", async () => {
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await Applicant.truncate({ cascade: true });
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("should delete all jobApplication if all companies are deleted", async () => {
      await createJobApplication();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await Company.truncate({ cascade: true });
      expect(await JobApplication.findAll()).toHaveLength(0);
    });
  });
});
