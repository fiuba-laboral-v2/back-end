import { NotificationEmailLog } from "$models";
import { NotificationEmailLogNotFoundError } from "./Errors";

export const NotificationEmailLogRepository = {
  save: (notificationEmailLog: NotificationEmailLog) => notificationEmailLog.save(),
  findByUuid: async (uuid: string) => {
    const notificationEmailLog = await NotificationEmailLog.findByPk(uuid);
    if (!notificationEmailLog) throw new NotificationEmailLogNotFoundError(uuid);

    return notificationEmailLog;
  },
  findAll: () => NotificationEmailLog.findAll(),
  truncate: () => NotificationEmailLog.destroy({ truncate: true })
};
