import moment from "moment";

export const DateTimeManager = {
  yesterday: () => moment().startOf("day").subtract(1, "day").toDate()
};
