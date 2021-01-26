import { UniqueConstraintError } from "sequelize";
import {
  NotificationEmailLogNotFoundError,
  NotificationEmailLogRepository
} from "$models/NotificationEmailLog";
import { NotificationEmailLog } from "$models";
import { UUID } from "$models/UUID";
import { UUID_REGEX } from "$test/models";
import MockDate from "mockdate";
import { DateTimeManager } from "$libs/DateTimeManager";
import { NotificationEmailLogConfig } from "$config";
import { range } from "lodash";

describe("NotificationEmailLogRepository", () => {
  const mandatoryAttributes = {
    notificationUuid: UUID.generate(),
    notificationTable: "AdminNotifications",
    success: true,
    message: "message"
  };

  beforeAll(async () => {
    await NotificationEmailLogRepository.truncate();
  });

  it("persists a new NotificationEmailLogRepository in the database", async () => {
    const log = new NotificationEmailLog(mandatoryAttributes);
    await NotificationEmailLogRepository.save(log);
    const persistedLog = await NotificationEmailLogRepository.findByUuid(log.uuid!);
    expect(persistedLog.uuid).toEqual(log.uuid);
  });

  it("sets an uuid for the log", async () => {
    const log = new NotificationEmailLog(mandatoryAttributes);
    await NotificationEmailLogRepository.save(log);
    expect(log.uuid).toEqual(expect.stringMatching(UUID_REGEX));
  });

  it("sets an createdAt timestamp for the log", async () => {
    const log = new NotificationEmailLog(mandatoryAttributes);
    await NotificationEmailLogRepository.save(log);
    expect(log.createdAt).toEqual(expect.any(Date));
  });

  it("throws an error if a log with the same uuid already exists", async () => {
    const uuid = UUID.generate();
    jest.spyOn(UUID, "generate").mockImplementation(() => uuid);
    const log = new NotificationEmailLog(mandatoryAttributes);
    await NotificationEmailLogRepository.save(log);
    expect(log.uuid).toEqual(uuid);
    const anotherLog = new NotificationEmailLog(mandatoryAttributes);
    await expect(NotificationEmailLogRepository.save(anotherLog)).rejects.toThrowErrorWithMessage(
      UniqueConstraintError,
      "Validation error"
    );
  });

  it("throws an error it tries to find a log with an uuid does does not belong to a persisted one", async () => {
    const uuid = UUID.generate();
    await expect(NotificationEmailLogRepository.findByUuid(uuid)).rejects.toThrowErrorWithMessage(
      NotificationEmailLogNotFoundError,
      NotificationEmailLogNotFoundError.buildMessage(uuid)
    );
  });

  it("deletes all logs that are older than the months by config ago", async () => {
    await NotificationEmailLogRepository.truncate();
    const { cleanupTimeThresholdInMonths } = NotificationEmailLogConfig;
    const createdAt = DateTimeManager.monthsAgo(cleanupTimeThresholdInMonths() * 2);
    const size = 10;
    for (const _ of range(size)) {
      MockDate.set(createdAt);
      await NotificationEmailLogRepository.save(new NotificationEmailLog(mandatoryAttributes));
      MockDate.reset();
    }
    const firstLog = new NotificationEmailLog(mandatoryAttributes);
    const secondLog = new NotificationEmailLog(mandatoryAttributes);
    await NotificationEmailLogRepository.save(firstLog);
    await NotificationEmailLogRepository.save(secondLog);
    await NotificationEmailLogRepository.cleanupOldEntries();
    const logs = await NotificationEmailLogRepository.findAll();
    const logUuids = logs.map(({ uuid }) => uuid!);

    expect(logs).toHaveLength(2);
    expect(logUuids).toEqual(expect.arrayContaining([firstLog.uuid, secondLog.uuid]));
  });

  it("deletes all logs when truncating the table", async () => {
    expect((await NotificationEmailLogRepository.findAll()).length).toBeGreaterThan(0);
    await NotificationEmailLogRepository.truncate();
    expect(await NotificationEmailLogRepository.findAll()).toHaveLength(0);
  });
});
