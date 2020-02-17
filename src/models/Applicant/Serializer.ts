import { Applicant } from "./index";

import map from "lodash/map";
import pick from "lodash/pick";

const ApplicantSerializer = {
  serialize: ({
    name,
    surname,
    padron,
    description,
    credits,
    careers,
    capabilities
  }: Applicant) => ({
    name,
    surname,
    padron,
    description,
    credits,
    careers: map(careers, career => pick(career, ["code", "description", "credits"])),
    capabilities: map(capabilities, capability => pick(capability, ["uuid", "description"]))
  })
};

export { ApplicantSerializer };
