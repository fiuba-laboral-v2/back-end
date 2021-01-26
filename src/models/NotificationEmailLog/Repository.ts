import { Op } from "sequelize";
import { NotificationEmailLogConfig } from "$config";
import { DateTimeManager } from "$libs/DateTimeManager";
import { NotificationEmailLog } from "$models";
import { NotificationEmailLogNotFoundError } from "./Errors";

export const NotificationEmailLogRepository = {
  save: (notificationEmailLog: NotificationEmailLog) => notificationEmailLog.save(),
  findByUuid: async (uuid: string) => {
    const notificationEmailLog = await NotificationEmailLog.findByPk(uuid);
    if (!notificationEmailLog) throw new NotificationEmailLogNotFoundError(uuid);

    return notificationEmailLog;
  },
  cleanupOldEntries: async () => {
    const { cleanupTimeThresholdInMonths } = NotificationEmailLogConfig;
    const ThresholdDate = DateTimeManager.monthsAgo(cleanupTimeThresholdInMonths());
    await NotificationEmailLog.destroy({ where: { createdAt: { [Op.lte]: ThresholdDate } } });
  },
  findAll: () => NotificationEmailLog.findAll(),
  truncate: () => NotificationEmailLog.destroy({ truncate: true })
};
