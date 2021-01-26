import { EmailApi, EmailService } from "$services/Email";
import { EmailServiceConfig } from "$config";
import { ISendEmail } from "$services/Email/interface";
import { isEqual, times } from "lodash";

describe("EmailService", () => {
  const sendEmailParams: ISendEmail = {
    sender: {
      name: "sebastian@blanco.com",
      email: "manuel@llauro.com"
    },
    receiverEmails: ["dylan@alvarez.com"],
    subject: "New Email",
    body: "I'm sending an email"
  };

  describe("send", () => {
    const retryCount = 20;

    const expectToCallEmailApi = async ({
      expected,
      shouldThrowError
    }: {
      shouldThrowError: (attemptCount: number) => boolean;
      expected: {
        attemptCount: number;
        errorWasThrown: boolean;
      };
    }) => {
      let paramsWereEqual = true;
      let attemptCount = 0;
      jest
        .spyOn(EmailServiceConfig, "retryIntervalsInSeconds")
        .mockImplementation(() => times(retryCount, () => 0));
      jest.spyOn(EmailApi, "send").mockImplementation(async params => {
        paramsWereEqual = isEqual(params, sendEmailParams) && paramsWereEqual;
        attemptCount += 1;
        if (shouldThrowError(attemptCount)) throw new Error();
      });
      const sendEmailJestMatcher = expect(EmailService.send({ params: sendEmailParams }));
      if (expected.errorWasThrown) {
        await sendEmailJestMatcher.rejects.toThrow();
      } else {
        await sendEmailJestMatcher.resolves.not.toThrow();
      }
      expect(paramsWereEqual).toBe(true);
      expect(attemptCount).toEqual(expected.attemptCount);
    };

    it("calls EmailApi and it succeeds on the first try", async () => {
      await expectToCallEmailApi({
        expected: {
          attemptCount: 1,
          errorWasThrown: false
        },
        shouldThrowError: () => false
      });
    });

    it("calls EmailApi and it always fails", async () => {
      await expectToCallEmailApi({
        expected: {
          attemptCount: 1 + retryCount,
          errorWasThrown: true
        },
        shouldThrowError: () => true
      });
    });

    it("calls EmailApi and it fails four times", async () => {
      const expectedAttemptCount = 14;
      await expectToCallEmailApi({
        expected: {
          attemptCount: expectedAttemptCount,
          errorWasThrown: false
        },
        shouldThrowError: attemptCount => attemptCount < expectedAttemptCount
      });
    });
  });
});
