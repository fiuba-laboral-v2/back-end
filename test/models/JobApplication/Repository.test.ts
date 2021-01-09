import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from "sequelize";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { OfferRepository } from "$models/Offer";
import { ApplicantType } from "$models/Applicant";
import { JobApplicationNotFoundError, JobApplicationRepository } from "$models/JobApplication";
import { Applicant, Company, JobApplication, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { User, UserRepository } from "$models/User";
import { isApprovalStatus } from "$models/SequelizeModelValidators";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { IForAllTargets, OfferGenerator } from "$generators/Offer";
import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

describe("JobApplicationRepository", () => {
  let student: Applicant;
  let graduate: Applicant;
  let studentAndGraduate: Applicant;
  let offers: IForAllTargets;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();

    const company = await CompanyGenerator.instance.withMinimumData();
    offers = await OfferGenerator.instance.forAllTargets({ companyUuid: company.uuid });

    student = await ApplicantGenerator.instance.student();
    graduate = await ApplicantGenerator.instance.graduate();
    studentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate();
  });

  describe("save", () => {
    const expectApplicantToApply = async (applicant: Applicant, offer: Offer) => {
      const jobApplication = applicant.applyTo(offer);
      await JobApplicationRepository.save(jobApplication);
      expect(jobApplication).toBeObjectContaining({
        offerUuid: offer.uuid,
        applicantUuid: applicant.uuid,
        approvalStatus: ApprovalStatus.pending
      });
    };

    const expectSaveToUpdateStatus = async (status: ApprovalStatus) => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      jobApplication.set({ approvalStatus: status });
      const { approvalStatus } = await JobApplicationRepository.save(jobApplication);
      expect(approvalStatus).toEqual(status);
    };

    it("allows student to apply to an offer for students", async () => {
      await expectApplicantToApply(student, offers[ApplicantType.student]);
    });

    it("allows student to apply to an offer for students and graduates", async () => {
      await expectApplicantToApply(student, offers[ApplicantType.both]);
    });

    it("allows graduate to apply to an offer for graduates", async () => {
      await expectApplicantToApply(graduate, offers[ApplicantType.graduate]);
    });

    it("allows graduate to apply to an offer for graduates and students", async () => {
      await expectApplicantToApply(graduate, offers[ApplicantType.both]);
    });

    it("allows student and graduate to apply to an offer for graduates", async () => {
      await expectApplicantToApply(studentAndGraduate, offers[ApplicantType.graduate]);
    });

    it("allows student and graduate to apply to an offer for students", async () => {
      await expectApplicantToApply(studentAndGraduate, offers[ApplicantType.student]);
    });

    it("allows student and graduate to apply to an offer for students and graduates", async () => {
      await expectApplicantToApply(studentAndGraduate, offers[ApplicantType.both]);
    });

    it("updates status to pending", async () => {
      await expectSaveToUpdateStatus(ApprovalStatus.pending);
    });

    it("updates status to approved", async () => {
      await expectSaveToUpdateStatus(ApprovalStatus.approved);
    });

    it("updates status to rejected", async () => {
      await expectSaveToUpdateStatus(ApprovalStatus.rejected);
    });

    it("throws an error if given applicantUuid that does not exist", async () => {
      const applicant = new Applicant();
      const jobApplication = applicant.applyTo(offers[ApplicantType.student]);
      await expect(JobApplicationRepository.save(jobApplication)).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "JobApplications" violates foreign key ' +
          'constraint "JobApplications_applicantUuid_fkey"'
      );
    });

    it("throws an error if given offerUuid that does not exist", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const jobApplication = applicant.applyTo(new Offer());
      await expect(jobApplication.save()).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "JobApplications" violates foreign key ' +
          'constraint "JobApplications_offerUuid_fkey"'
      );
    });

    it("throws an error if status is invalid and does not update the jobApplication", async () => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      jobApplication.set({ approvalStatus: "invalidStatus" as ApprovalStatus });
      await expect(JobApplicationRepository.save(jobApplication)).rejects.toThrowErrorWithMessage(
        ValidationError,
        isApprovalStatus.validate.isIn.msg
      );
      const { approvalStatus } = await JobApplicationRepository.findByUuid(jobApplication.uuid);
      expect(approvalStatus).toEqual(ApprovalStatus.pending);
    });

    it("throws an error if jobApplication already exists", async () => {
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const offer = offers[ApplicantType.graduate];
      await JobApplicationRepository.save(applicant.applyTo(offer));
      await expect(
        JobApplicationRepository.save(applicant.applyTo(offer))
      ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
    });
  });

  describe("Associations", () => {
    it("gets Applicant and offer from a jobApplication", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      applicant.applyTo(offers[ApplicantType.graduate]);
      const jobApplication = applicant.applyTo(offers[ApplicantType.graduate]);
      await JobApplicationRepository.save(jobApplication);
      expect((await jobApplication.getApplicant()).toJSON()).toMatchObject(applicant.toJSON());
      expect((await jobApplication.getOffer()).toJSON()).toMatchObject(
        offers[ApplicantType.graduate].toJSON()
      );
    });

    it("gets all applicant's jobApplications", async () => {
      const graduateApplicant = await ApplicantGenerator.instance.graduate();
      graduateApplicant.applyTo(offers[ApplicantType.graduate]);
      const jobApplication = graduateApplicant.applyTo(offers[ApplicantType.graduate]);
      await JobApplicationRepository.save(jobApplication);
      const applicantsJobApplications = await graduateApplicant.getJobApplications();
      expect(applicantsJobApplications.map(aJobApplication => aJobApplication.toJSON())).toEqual([
        jobApplication.toJSON()
      ]);
    });
  });

  describe("findByApplicantAndOffer", () => {
    it("returns a jobApplication for an applicant that applied for an offer", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      const offer = offers[ApplicantType.both];
      await JobApplicationRepository.save(applicant.applyTo(offer));
      const jobApplication = await JobApplicationRepository.findByApplicantAndOffer(
        applicant,
        offer
      );
      expect(jobApplication.offerUuid).toEqual(offer.uuid);
      expect(jobApplication.applicantUuid).toEqual(applicant.uuid);
    });

    it("throws an error if the jobApplication is not persisted", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      const offer = offers[ApplicantType.both];
      await expect(
        JobApplicationRepository.findByApplicantAndOffer(applicant, offer)
      ).rejects.toThrowErrorWithMessage(
        JobApplicationNotFoundError,
        JobApplicationNotFoundError.buildMessage()
      );
    });
  });

  describe("hasApplied", () => {
    it("returns true if applicant applied for offer", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      await JobApplicationRepository.save(applicant.applyTo(offers[ApplicantType.both]));
      const hasApplied = await JobApplicationRepository.hasApplied(
        applicant,
        offers[ApplicantType.both]
      );
      expect(hasApplied).toBe(true);
    });

    it("returns false if applicant has not applied to the offer", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      expect(
        await JobApplicationRepository.hasApplied(applicant, offers[ApplicantType.graduate])
      ).toBe(false);
    });
  });

  describe("findLatestByCompanyUuid", () => {
    const createJobApplication = async (companyUuid: string, status: ApprovalStatus) => {
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      const jobApplication = studentAndGraduate.applyTo(offer);
      jobApplication.set({ approvalStatus: status });
      return JobApplicationRepository.save(jobApplication);
    };

    const expectToFindMyJobApplication = async (statuses: ApprovalStatus[]) => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withCompleteData();
      const jobApplications = await Promise.all(
        statuses.map(status => createJobApplication(companyUuid, status))
      );
      const latestJobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
        companyUuid
      });
      expect(latestJobApplications.shouldFetchMore).toEqual(false);
      expect(latestJobApplications.results).toHaveLength(jobApplications.length);
      expect(latestJobApplications.results).toEqual(
        expect.arrayContaining(
          jobApplications
            .map(({ uuid, approvalStatus }) => expect.objectContaining({ uuid, approvalStatus }))
            .reverse()
        )
      );
    };

    it("returns the only pending job applications for my company", async () => {
      await expectToFindMyJobApplication([ApprovalStatus.pending]);
    });

    it("returns the only approved job applications for my company", async () => {
      await expectToFindMyJobApplication([ApprovalStatus.approved]);
    });

    it("returns the only rejected job applications for my company", async () => {
      await expectToFindMyJobApplication([ApprovalStatus.rejected]);
    });

    it("returns the only pending, approved and rejected job applications for my company", async () => {
      await expectToFindMyJobApplication([
        ApprovalStatus.pending,
        ApprovalStatus.approved,
        ApprovalStatus.rejected
      ]);
    });

    it("returns the only pending and approved job applications for my company", async () => {
      await expectToFindMyJobApplication([ApprovalStatus.pending, ApprovalStatus.approved]);
    });

    it("returns the only pending and rejected job applications for my company", async () => {
      await expectToFindMyJobApplication([ApprovalStatus.pending, ApprovalStatus.rejected]);
    });

    it("returns the only approved and rejected job applications for my company", async () => {
      await expectToFindMyJobApplication([ApprovalStatus.approved, ApprovalStatus.rejected]);
    });

    it("returns no job applications if my company has any", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
        companyUuid
      });
      expect(jobApplications.results).toHaveLength(0);
      expect(jobApplications.shouldFetchMore).toEqual(false);
    });

    it("returns the latest job applications first for my company", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const anotherCompany = await CompanyGenerator.instance.withMinimumData();
      const myOffer1 = await OfferGenerator.instance.forStudents({ companyUuid });
      const myOffer2 = await OfferGenerator.instance.forGraduates({ companyUuid });
      const notMyOffer = await OfferGenerator.instance.forStudentsAndGraduates({
        companyUuid: anotherCompany.uuid
      });

      await JobApplicationRepository.save(studentAndGraduate.applyTo(myOffer1));
      await JobApplicationRepository.save(studentAndGraduate.applyTo(myOffer2));
      await JobApplicationRepository.save(studentAndGraduate.applyTo(notMyOffer));
      const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
        companyUuid: companyUuid
      });
      expect(jobApplications.shouldFetchMore).toEqual(false);
      expect(jobApplications.results).toEqual([
        expect.objectContaining({
          offerUuid: myOffer2.uuid,
          applicantUuid: studentAndGraduate.uuid,
          approvalStatus: ApprovalStatus.pending
        }),
        expect.objectContaining({
          offerUuid: myOffer1.uuid,
          applicantUuid: studentAndGraduate.uuid,
          approvalStatus: ApprovalStatus.pending
        })
      ]);
    });

    describe("fetchMore", () => {
      let jobApplicationsByDescUpdatedAt: JobApplication[] = [];
      let company: Company;

      beforeAll(async () => {
        await JobApplicationRepository.truncate();

        company = await CompanyGenerator.instance.withCompleteData();
        for (const _ of range(15)) {
          jobApplicationsByDescUpdatedAt.push(
            await JobApplicationGenerator.instance.toTheCompany(company.uuid)
          );
        }
        jobApplicationsByDescUpdatedAt = jobApplicationsByDescUpdatedAt.sort(
          jobApplication => -jobApplication.updatedAt
        );
      });

      it("gets the next 3 jobApplications", async () => {
        const itemsPerPage = 3;
        const lastIndex = 9;
        mockItemsPerPage(itemsPerPage);

        const lastJobApplication = jobApplicationsByDescUpdatedAt[lastIndex];
        const jobApplications = await JobApplicationRepository.findLatestByCompanyUuid({
          companyUuid: company.uuid,
          updatedBeforeThan: {
            dateTime: lastJobApplication.updatedAt,
            uuid: lastJobApplication.uuid
          }
        });
        expect(jobApplications.results.map(j => j.uuid)).toEqual(
          jobApplicationsByDescUpdatedAt
            .slice(lastIndex + 1, lastIndex + 1 + itemsPerPage)
            .map(offer => offer.uuid)
        );

        expect(jobApplications.shouldFetchMore).toBe(true);
      });
    });
  });

  describe("findLatest", () => {
    let company: Company;
    let anotherCompany: Company;
    let applicant: Applicant;
    let offer1: Offer;
    let offer2: Offer;
    let offer3: Offer;
    let firstJobApplication: JobApplication;
    let secondJobApplication: JobApplication;
    let thirdJobApplication: JobApplication;
    let user: User;

    beforeAll(async () => {
      await JobApplicationRepository.truncate();

      applicant = studentAndGraduate;
      company = await CompanyGenerator.instance.withMinimumData();
      anotherCompany = await CompanyGenerator.instance.withMinimumData();
      anotherCompany.set({ companyName: "Despegar" });
      await CompanyRepository.save(anotherCompany);

      offer1 = await OfferGenerator.instance.forStudents({ companyUuid: company.uuid });
      offer2 = await OfferGenerator.instance.forGraduates({ companyUuid: company.uuid });
      offer3 = await OfferGenerator.instance.forStudentsAndGraduates({
        companyUuid: anotherCompany.uuid
      });

      firstJobApplication = applicant.applyTo(offer1);
      secondJobApplication = applicant.applyTo(offer2);
      thirdJobApplication = applicant.applyTo(offer3);

      await JobApplicationRepository.save(firstJobApplication);
      await JobApplicationRepository.save(secondJobApplication);
      await JobApplicationRepository.save(thirdJobApplication);

      user = await UserRepository.findByUuid(applicant.userUuid);
    });

    it("returns the latest job applications first", async () => {
      const itemsPerPage = 2;
      mockItemsPerPage(itemsPerPage);
      const jobApplications = await JobApplicationRepository.findLatest();
      expect(jobApplications.shouldFetchMore).toEqual(true);
      expect(jobApplications.results).toEqual([
        expect.objectContaining({
          offerUuid: offer3.uuid,
          applicantUuid: applicant.uuid,
          approvalStatus: ApprovalStatus.pending
        }),
        expect.objectContaining({
          offerUuid: offer2.uuid,
          applicantUuid: applicant.uuid,
          approvalStatus: ApprovalStatus.pending
        })
      ]);
    });

    it("returns the job applications by applicantName, companyName and offerTitle", async () => {
      const { results, shouldFetchMore } = await JobApplicationRepository.findLatest({
        applicantName: `${user.name} ${user.surname}`,
        companyName: company.companyName,
        offerTitle: offer1.title
      });
      expect(shouldFetchMore).toEqual(false);
      expect(results.map(({ uuid }) => uuid)).toEqual([firstJobApplication.uuid]);
    });

    it("returns the job applications by companyName", async () => {
      const { results, shouldFetchMore } = await JobApplicationRepository.findLatest({
        companyName: company.companyName
      });
      expect(shouldFetchMore).toEqual(false);
      expect(results.map(({ uuid }) => uuid)).toEqual([
        secondJobApplication.uuid,
        firstJobApplication.uuid
      ]);
    });

    it("returns the job applications by the other companyName", async () => {
      const { results, shouldFetchMore } = await JobApplicationRepository.findLatest({
        companyName: anotherCompany.companyName
      });
      expect(shouldFetchMore).toEqual(false);
      expect(results.map(({ uuid }) => uuid)).toEqual([thirdJobApplication.uuid]);
    });

    it("returns the job applications by applicant name", async () => {
      const { results, shouldFetchMore } = await JobApplicationRepository.findLatest({
        applicantName: user.name
      });
      expect(shouldFetchMore).toEqual(false);
      expect(results.map(({ uuid }) => uuid)).toEqual([
        thirdJobApplication.uuid,
        secondJobApplication.uuid,
        firstJobApplication.uuid
      ]);
    });

    it("returns the job applications by applicant surname", async () => {
      const { results, shouldFetchMore } = await JobApplicationRepository.findLatest({
        applicantName: user.surname
      });
      expect(shouldFetchMore).toEqual(false);
      expect(results.map(({ uuid }) => uuid)).toEqual([
        thirdJobApplication.uuid,
        secondJobApplication.uuid,
        firstJobApplication.uuid
      ]);
    });

    it("returns no job applications by concatenating both company names", async () => {
      const { results, shouldFetchMore } = await JobApplicationRepository.findLatest({
        companyName: `${company.companyName} \n\n ${anotherCompany.companyName}`
      });
      expect(shouldFetchMore).toEqual(false);
      expect(results).toEqual([]);
    });
  });

  describe("findByUuid", () => {
    it("returns a jobApplication By Uuid", async () => {
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      expect((await JobApplicationRepository.findByUuid(jobApplication.uuid)).toJSON()).toEqual(
        jobApplication.toJSON()
      );
    });

    it("throws an error if jobApplication does not exist", async () => {
      const nonExistentJobApplicationUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        JobApplicationRepository.findByUuid(nonExistentJobApplicationUuid)
      ).rejects.toThrowErrorWithMessage(
        JobApplicationNotFoundError,
        JobApplicationNotFoundError.buildMessage(nonExistentJobApplicationUuid)
      );
    });
  });

  describe("Delete", () => {
    it("deletes all jobApplications", async () => {
      await JobApplicationRepository.truncate();
      await JobApplicationGenerator.instance.withMinimumData();
      await JobApplicationGenerator.instance.withMinimumData();
      expect(await JobApplication.findAll()).toHaveLength(2);
      await JobApplicationRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all offers are deleted", async () => {
      await JobApplicationRepository.truncate();
      await JobApplicationGenerator.instance.withMinimumData();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await OfferRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all applicants are deleted", async () => {
      await JobApplicationRepository.truncate();
      await JobApplicationGenerator.instance.withMinimumData();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await UserRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });

    it("deletes all jobApplication if all companies are deleted", async () => {
      await JobApplicationRepository.truncate();
      await JobApplicationGenerator.instance.withMinimumData();
      expect(await JobApplication.findAll()).toHaveLength(1);
      await CompanyRepository.truncate();
      expect(await JobApplication.findAll()).toHaveLength(0);
    });
  });
});
