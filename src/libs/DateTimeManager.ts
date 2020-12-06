import moment from "moment";

export const DateTimeManager = {
  yesterday: () => moment().startOf("day").subtract(1, "day").toDate(),
  daysToDate: (days: number) => moment().endOf("day").add(days, "days")
};
