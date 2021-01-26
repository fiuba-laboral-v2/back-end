import moment from "moment";

export const DateTimeManager = {
  yesterday: () => moment().startOf("day").subtract(1, "day").toDate(),
  daysFromNow: (days: number) => moment().endOf("day").add(days, "days"),
  monthsAgo: (months: number) => moment().subtract(months, "months").toDate()
};
