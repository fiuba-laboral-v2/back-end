import { UniqueConstraintError } from "sequelize";
import { ApplicantNotFound, ApplicantWithNoCareersError } from "$models/Applicant/Errors";

import { CareerRepository } from "$models/Career";
import { ApplicantRepository, ApplicantType } from "$models/Applicant";
import { Applicant, Career } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UserRepository } from "$models/User";
import { CapabilityRepository } from "$models/Capability";

import { ApplicantGenerator } from "$generators/Applicant";
import { UserGenerator } from "$generators/User";
import { CareerGenerator } from "$generators/Career";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

describe("ApplicantRepository", () => {
  let firstCareer: Career;
  let secondCareer: Career;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CareerRepository.truncate();
    await CapabilityRepository.truncate();

    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
  });

  describe("save", () => {
    it("throws an error if the applicant user already exists", async () => {
      const user = await UserGenerator.fiubaUser();
      const applicant = new Applicant({ padron: 1234, userUuid: user.uuid });
      const anotherApplicant = new Applicant({ padron: 1234, userUuid: user.uuid });
      await ApplicantRepository.save(applicant);
      await expect(ApplicantRepository.save(anotherApplicant)).rejects.toThrowErrorWithMessage(
        UniqueConstraintError,
        "Validation error"
      );
    });
  });

  describe("getType", () => {
    it("creates a graduate", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      expect(await applicant.getType()).toEqual(ApplicantType.graduate);
    });

    it("creates a student", async () => {
      const applicant = await ApplicantGenerator.instance.student();
      expect(await applicant.getType()).toEqual(ApplicantType.student);
    });

    it("creates an applicant that is a student for one career and a graduate for another one", async () => {
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      expect(await applicant.getType()).toEqual(ApplicantType.both);
    });

    it("throws an error if the applicant has no careers", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      await expect(applicant.getType()).rejects.toThrowErrorWithMessage(
        ApplicantWithNoCareersError,
        ApplicantWithNoCareersError.buildMessage(applicant.uuid)
      );
    });
  });

  describe("Get", () => {
    it("retrieves applicant by padron", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const persistedApplicant = await ApplicantRepository.findByPadron(applicant.padron);
      expect(applicant.uuid).toEqual(persistedApplicant.uuid);
    });

    it("retrieves applicant by uuid", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const persistedApplicant = await ApplicantRepository.findByUuid(applicant.uuid);
      expect(applicant.uuid).toEqual(persistedApplicant.uuid);
    });

    it("throws ApplicantNotFound if the applicant doesn't exists", async () => {
      const { padron } = ApplicantGenerator.data.minimum();
      await expect(ApplicantRepository.findByPadron(padron)).rejects.toThrow(ApplicantNotFound);
    });

    describe("find queries", () => {
      let student: Applicant;
      let graduate: Applicant;
      let studentAndGraduate: Applicant;

      const generateApplicants = async () => {
        return [
          await ApplicantGenerator.instance.student({ career: firstCareer }),
          await ApplicantGenerator.instance.graduate({ career: firstCareer }),
          await ApplicantGenerator.instance.studentAndGraduate({
            finishedCareer: firstCareer,
            careerInProgress: secondCareer
          })
        ];
      };

      beforeAll(async () => {
        await ApplicantRepository.truncate();
        [student, graduate, studentAndGraduate] = await generateApplicants();

        const studentAndGraduateUser = await UserRepository.findByUuid(studentAndGraduate.userUuid);
        const name = "DylaN FraNÇois GUStävo";
        const surname = "Álvarez Avalos";
        studentAndGraduateUser.setAttributes({ name, surname });
        await UserRepository.save(studentAndGraduateUser);
      });

      describe("find", () => {
        it("returns graduates", async () => {
          const applicants = await ApplicantRepository.find({
            applicantType: ApplicantType.graduate
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(
            expect.arrayContaining([studentAndGraduate.uuid, graduate.uuid])
          );
        });

        it("returns students", async () => {
          const applicants = await ApplicantRepository.find({
            applicantType: ApplicantType.student
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(
            expect.arrayContaining([studentAndGraduate.uuid, student.uuid])
          );
        });

        it("returns applicants that are students and graduates", async () => {
          const applicants = await ApplicantRepository.find({
            applicantType: ApplicantType.both
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(
            expect.arrayContaining([studentAndGraduate.uuid, graduate.uuid, student.uuid])
          );
        });

        it("returns applicants that are in the first career", async () => {
          const applicants = await ApplicantRepository.find({
            careerCodes: [firstCareer.code]
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(
            expect.arrayContaining([studentAndGraduate.uuid, graduate.uuid, student.uuid])
          );
        });

        it("returns applicants that are in the second career", async () => {
          const applicants = await ApplicantRepository.find({
            careerCodes: [secondCareer.code]
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase name", async () => {
          const applicants = await ApplicantRepository.find({ name: "dylan" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase middle name with spaces at the beginning", async () => {
          const applicants = await ApplicantRepository.find({ name: "  francois" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase first surname with no accents", async () => {
          const applicants = await ApplicantRepository.find({ name: "alvarez" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase last surname", async () => {
          const applicants = await ApplicantRepository.find({ name: "avalos" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase names in different order with spaces", async () => {
          const applicants = await ApplicantRepository.find({ name: "gustavo \n  dylán" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by name skipping newline character", async () => {
          const applicants = await ApplicantRepository.find({ name: "gustavo\ndylán" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by name skipping multiples newline character", async () => {
          const applicants = await ApplicantRepository.find({ name: "gustavo\n\n\n\n\n\ndylán" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by last surname with other capitalize letters and second name", async () => {
          const applicants = await ApplicantRepository.find({ name: "AVAlos francOÍs" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by full lowercase surname with no accents", async () => {
          const applicants = await ApplicantRepository.find({ name: "avalos alvarez" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by second lowercase name and first lowercase name", async () => {
          const applicants = await ApplicantRepository.find({ name: "francois dylan" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by first name with some capitalize letters", async () => {
          const applicants = await ApplicantRepository.find({ name: "DylaN" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching the exact second name", async () => {
          const applicants = await ApplicantRepository.find({ name: "FraNÇois" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching the exact third name", async () => {
          const applicants = await ApplicantRepository.find({ name: "GUStävo" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by the exact full name", async () => {
          const applicants = await ApplicantRepository.find({
            name: "DylaN FraNÇois GUStävo"
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by the exact first surname", async () => {
          const applicants = await ApplicantRepository.find({ name: "Álvarez" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by the exact second surname", async () => {
          const applicants = await ApplicantRepository.find({ name: "Avalos" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by the exact full surname", async () => {
          const applicants = await ApplicantRepository.find({ name: "Álvarez Avalos" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([studentAndGraduate.uuid]);
        });

        it("returns no applicants if the first name does not match completely", async () => {
          const applicants = await ApplicantRepository.find({ name: "dyl" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([]);
        });

        it("returns no applicants if the second and third name does not match completely", async () => {
          const applicants = await ApplicantRepository.find({ name: "fra gus" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([]);
        });

        it("returns no applicants if the name or surname does not match", async () => {
          const applicants = await ApplicantRepository.find({ name: "Sebastián Blanco" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([]);
        });

        it("returns no applicants if the name or surname does not match with one of the filter name", async () => {
          const applicants = await ApplicantRepository.find({ name: "BoB DylaN" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([]);
        });

        it("returns no applicants if given a surname does does not match", async () => {
          const applicants = await ApplicantRepository.find({
            name: "Álvarez Avalos Dalila"
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual([]);
        });

        it("returns all applicants if given an empty string", async () => {
          const applicants = await ApplicantRepository.find({ name: "" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(
            expect.arrayContaining([studentAndGraduate.uuid, graduate.uuid, student.uuid])
          );
        });

        it("returns all applicants if given a space", async () => {
          const applicants = await ApplicantRepository.find({ name: "  " });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(
            expect.arrayContaining([studentAndGraduate.uuid, graduate.uuid, student.uuid])
          );
        });

        it("returns all applicants if given a newline character", async () => {
          const applicants = await ApplicantRepository.find({ name: "\n" });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(
            expect.arrayContaining([studentAndGraduate.uuid, graduate.uuid, student.uuid])
          );
        });

        it("returns students in the first career", async () => {
          const applicants = await ApplicantRepository.find({
            applicantType: ApplicantType.student,
            careerCodes: [firstCareer.code]
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(expect.arrayContaining([student.uuid]));
        });

        it("returns students in the second career", async () => {
          const applicants = await ApplicantRepository.find({
            applicantType: ApplicantType.student,
            careerCodes: [secondCareer.code]
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(expect.arrayContaining([studentAndGraduate.uuid]));
        });

        it("returns graduates in the first career", async () => {
          const applicants = await ApplicantRepository.find({
            applicantType: ApplicantType.graduate,
            careerCodes: [firstCareer.code]
          });
          const applicantUuids = applicants.map(({ uuid }) => uuid);
          expect(applicantUuids).toEqual(
            expect.arrayContaining([studentAndGraduate.uuid, graduate.uuid])
          );
        });
      });

      describe("findLatest", () => {
        it("returns the latest applicant first", async () => {
          const applicants = await ApplicantRepository.findLatest();
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results).toEqual([
            expect.objectContaining({
              uuid: studentAndGraduate.uuid,
              padron: studentAndGraduate.padron,
              approvalStatus: ApprovalStatus.approved
            }),
            expect.objectContaining({
              uuid: graduate.uuid,
              padron: graduate.padron,
              approvalStatus: ApprovalStatus.approved
            }),
            expect.objectContaining({
              uuid: student.uuid,
              padron: student.padron,
              approvalStatus: ApprovalStatus.approved
            })
          ]);
        });

        it("returns students", async () => {
          const applicants = await ApplicantRepository.findLatest({
            applicantType: ApplicantType.student
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
            studentAndGraduate.uuid,
            student.uuid
          ]);
        });

        it("returns graduates", async () => {
          const applicants = await ApplicantRepository.findLatest({
            applicantType: ApplicantType.graduate
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
            studentAndGraduate.uuid,
            graduate.uuid
          ]);
        });

        it("returns applicants that are students and graduates", async () => {
          const applicants = await ApplicantRepository.findLatest({
            applicantType: ApplicantType.both
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
            studentAndGraduate.uuid,
            graduate.uuid,
            student.uuid
          ]);
        });

        it("returns applicants that are in the first career", async () => {
          const applicants = await ApplicantRepository.findLatest({
            careerCodes: [firstCareer.code]
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
            studentAndGraduate.uuid,
            graduate.uuid,
            student.uuid
          ]);
        });

        it("returns applicants that are in the second career", async () => {
          const applicants = await ApplicantRepository.findLatest({
            careerCodes: [secondCareer.code]
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase name", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "dylan" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase middle name with spaces at the beginning", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "  francois" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase first surname with no accents", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "alvarez" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase last surname", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "avalos" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by lowercase names in different order with spaces", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "gustavo \n  dylán" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by name skipping newline character", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "gustavo\ndylán" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by last surname with other capitalize letters and second name", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "AVAlos francOÍs" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by full lowercase surname with no accents", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "avalos alvarez" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by second lowercase name and first lowercase name", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "francois dylan" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by first name with some capitalize letters", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "DylaN" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching the exact second name", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "FraNÇois" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching the exact third name", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "GUStävo" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by the exact full name", async () => {
          const applicants = await ApplicantRepository.findLatest({
            name: "DylaN FraNÇois GUStävo"
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by the exact first surname", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "Álvarez" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by the exact second surname", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "Avalos" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns applicants matching by the exact full surname", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "Álvarez Avalos" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns no applicants if the first name does not match completely", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "dyl" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([]);
        });

        it("returns no applicants if the second and third name does not match completely", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "fra gus" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([]);
        });

        it("returns no applicants if the name or surname does not match", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "Sebastián Blanco" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([]);
        });

        it("returns no applicants if the name or surname does not match with one of the filter name", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "BoB DylaN" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([]);
        });

        it("returns no applicants if given a surname does does not match", async () => {
          const applicants = await ApplicantRepository.findLatest({
            name: "Álvarez Avalos Dalila"
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([]);
        });

        it("returns all applicants if given an empty string", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
            studentAndGraduate.uuid,
            graduate.uuid,
            student.uuid
          ]);
        });

        it("returns all applicants if given a space", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "  " });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
            studentAndGraduate.uuid,
            graduate.uuid,
            student.uuid
          ]);
        });

        it("returns all applicants if given a newline character", async () => {
          const applicants = await ApplicantRepository.findLatest({ name: "\n" });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
            studentAndGraduate.uuid,
            graduate.uuid,
            student.uuid
          ]);
        });

        it("returns students in the first career", async () => {
          const applicants = await ApplicantRepository.findLatest({
            applicantType: ApplicantType.student,
            careerCodes: [firstCareer.code]
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([student.uuid]);
        });

        it("returns students in the second career", async () => {
          const applicants = await ApplicantRepository.findLatest({
            applicantType: ApplicantType.student,
            careerCodes: [secondCareer.code]
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
        });

        it("returns graduates in the first career", async () => {
          const applicants = await ApplicantRepository.findLatest({
            applicantType: ApplicantType.graduate,
            careerCodes: [firstCareer.code]
          });
          expect(applicants.shouldFetchMore).toEqual(false);
          expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
            studentAndGraduate.uuid,
            graduate.uuid
          ]);
        });

        describe("fetchMore", () => {
          let applicant4: Applicant;
          let applicant5: Applicant;
          let applicant6: Applicant;
          let applicant7: Applicant;

          beforeAll(async () => {
            [applicant4, applicant5, applicant6] = await generateApplicants();
            [applicant7, ,] = await generateApplicants();
          });

          it("gets the next 3 Applicants", async () => {
            const itemsPerPage = 3;
            mockItemsPerPage(itemsPerPage);

            const updatedBeforeThan = {
              dateTime: applicant7.updatedAt,
              uuid: applicant7.uuid
            };

            const applicants = await ApplicantRepository.findLatest({ updatedBeforeThan });
            expect(applicants.results).toEqual([
              expect.objectContaining({
                uuid: applicant6.uuid,
                padron: applicant6.padron,
                approvalStatus: ApprovalStatus.approved
              }),
              expect.objectContaining({
                uuid: applicant5.uuid,
                padron: applicant5.padron,
                approvalStatus: ApprovalStatus.approved
              }),
              expect.objectContaining({
                uuid: applicant4.uuid,
                padron: applicant4.padron,
                approvalStatus: ApprovalStatus.approved
              })
            ]);
            expect(applicants.shouldFetchMore).toBe(true);
          });
        });
      });
    });
  });

  const generateSomeApplicants = async () => {
    await ApplicantGenerator.instance.student({ career: firstCareer });
    await ApplicantGenerator.instance.graduate({ career: firstCareer });
    await ApplicantGenerator.instance.studentAndGraduate({
      finishedCareer: firstCareer,
      careerInProgress: secondCareer
    });
  };

  describe("countStudents", () => {
    beforeAll(async () => {
      await ApplicantRepository.truncate();
      await generateSomeApplicants();
    });

    it("returns the amount of Applicants that are students or both", async () => {
      const count = await ApplicantRepository.countStudents();
      expect(count).toBe(2);
    });
  });

  describe("countGraduates", () => {
    beforeAll(async () => {
      await ApplicantRepository.truncate();
      await generateSomeApplicants();
    });

    it("returns the amount of Applicants that are graduates of both", async () => {
      const count = await ApplicantRepository.countGraduates();
      expect(count).toBe(2);
    });
  });
});
