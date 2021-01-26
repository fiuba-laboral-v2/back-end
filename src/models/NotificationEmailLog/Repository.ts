import { Op, Transaction } from "sequelize";
import { NotificationEmailLogConfig, Database } from "$config";
import { DateTimeManager } from "$libs/DateTimeManager";
import { NotificationEmailLog } from "$models";
import { NotificationEmailLogNotFoundError } from "./Errors";

export const NotificationEmailLogRepository = {
  save: async (notificationEmailLog: NotificationEmailLog) => {
    const random = Math.random();
    await Database.transaction(async transaction => {
      if (random < 0.1) await NotificationEmailLogRepository.cleanupOldEntries(transaction);
      await notificationEmailLog.save({ transaction });
    });
  },
  findByUuid: async (uuid: string) => {
    const notificationEmailLog = await NotificationEmailLog.findByPk(uuid);
    if (!notificationEmailLog) throw new NotificationEmailLogNotFoundError(uuid);

    return notificationEmailLog;
  },
  cleanupOldEntries: async (transaction?: Transaction) => {
    const { cleanupTimeThresholdInMonths } = NotificationEmailLogConfig;
    const ThresholdDate = DateTimeManager.monthsAgo(cleanupTimeThresholdInMonths());
    await NotificationEmailLog.destroy({
      where: { createdAt: { [Op.lte]: ThresholdDate } },
      transaction
    });
  },
  findAll: () => NotificationEmailLog.findAll(),
  truncate: () => NotificationEmailLog.destroy({ truncate: true })
};
