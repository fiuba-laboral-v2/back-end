import { User } from "./models/User";
import { Environment } from "./config/Environment";
import { sign, verify } from "jsonwebtoken";
import { Application } from "express";
import jwt from "express-jwt";
import { ICurrentUser } from "./graphql/Context/graphqlContext";
import { AuthConfig } from "./config/AuthConfig";
import { CompanyRepository } from "./models/Company";
import { CompanyUser } from "./models/CompanyUser";

let JWT_SECRET: string;
if (["test", "development", "test_travis"].includes(Environment.NODE_ENV)) {
  JWT_SECRET = "Environment.JWT_SECRET";
} else {
  if (!Environment.JWT_SECRET) throw new Error("JWT_SECRET not set");
  JWT_SECRET = Environment.JWT_SECRET;
}

const createCompanyContext = async (companyUser: CompanyUser) => {
  const company = await CompanyRepository.findByUuid(companyUser.companyUuid);
  return {
    uuid: companyUser.companyUuid,
    approvalStatus: company.approvalStatus
  };
};

export const JWT = {
  createToken: async (user: User) => {
    const applicant = await user.getApplicant();
    const companyUser = await user.getCompanyUser();
    const isApplicant = applicant?.uuid && !companyUser?.companyUuid;
    const isCompanyUser = !applicant?.uuid && companyUser?.companyUuid;
    const payload = {
      uuid: user.uuid,
      email: user.email,
      ...(isApplicant && { applicantUuid: applicant.uuid }),
      ...(isCompanyUser && { company: await createCompanyContext(companyUser) })
    };

    return sign(
      payload,
      JWT_SECRET,
      { expiresIn: AuthConfig.JWT.expiresIn }
    );
  },
  decodeToken: (token: string): ICurrentUser | undefined => {
    try {
      const payload = verify(token, JWT_SECRET) as ICurrentUser;
      const user = {
        uuid: payload.uuid,
        email: payload.email
      };
      const applicantUuid = !payload.company && payload.applicantUuid;
      const company = !payload.applicantUuid && payload.company;
      if (company) return { ...user, company };
      if (applicantUuid) return { ...user, applicantUuid };
      return user;
    } catch (e) {
      return;
    }
  },
  applyMiddleware: ({ app }: { app: Application }) => {
    app.use(
      jwt({
        secret: JWT_SECRET,
        credentialsRequired: false
      })
    );
  },
  extractTokenPayload: (token: string): ICurrentUser | undefined => JWT.decodeToken(token)
};
