import fetchMock from "fetch-mock";
import { Envelope, FIUBAUsersApi } from "../../../src/services/FIUBAUsers";
import { AuthenticateFaultError, AuthenticateUnknownError } from "../../../src/services/FIUBAUsers";
import { FiubaUsersServiceConfig } from "../../../src/config";
import { MockEnvelope } from "./MockEnvelope";

const invalidCredentials = {
  username: "badUsername",
  password: "badPassword"
};

const validCredentials = {
  username: "goodUsername",
  password: "goodPassword"
};

const mockRequestEnvelop = (mockEnvelop: string) => {
  jest.spyOn(Envelope, "buildAuthenticate").mockReturnValue(mockEnvelop);
};

const stubRequest = ({ status, response }: { status: number; response: object }) =>
  fetchMock.mock(
    {
      url: FiubaUsersServiceConfig.url,
      method: "POST",
      headers: FIUBAUsersApi.headers()
    },
    {
      status: status,
      body: response
    }
  );

describe("FIUBAUsersApi", () => {
  afterEach(() => fetchMock.restore());

  it("returns false if the credentials are incorrect", async () => {
    stubRequest({ status: 200, response: MockEnvelope.AuthenticateSuccessResponse(false) });
    expect(
      await FIUBAUsersApi.authenticate(invalidCredentials)
    ).toBe(false);
  });

  it("returns true if the credentials are correct", async () => {
    stubRequest({ status: 200, response: MockEnvelope.AuthenticateSuccessResponse(true) });
    expect(
      await FIUBAUsersApi.authenticate(validCredentials)
    ).toBe(true);
  });

  it("throws an error if the envelop has an invalid format", async () => {
    mockRequestEnvelop(MockEnvelope.AuthenticateInvalidFormatRequest(validCredentials));
    const errorMessage = "error in msg parsing: XML error parsing SOAP payload on line 1: required";
    stubRequest({
      status: 500,
      response: MockEnvelope.AuthenticateErrorResponse(errorMessage)
    });
    await expect(
      FIUBAUsersApi.authenticate(validCredentials)
    ).rejects.toThrowErrorWithMessage(Error, errorMessage);
  });

  it("throws error if the requested operation is not defined", async () => {
    mockRequestEnvelop(MockEnvelope.AuthenticateUndefinedOperationRequest(validCredentials));
    const responseError = MockEnvelope.AuthenticateErrorResponse(
      "Operation UNDEFINED_OPERATION is not defined in the WSDL for this service"
    );
    stubRequest({
      status: 500,
      response: responseError
    });
    await expect(
      FIUBAUsersApi.authenticate(validCredentials)
    ).rejects.toThrowErrorWithMessage(
      AuthenticateFaultError,
      AuthenticateFaultError.buildMessage(responseError)
    );
  });

  it("throws unknown error if status code is different from 200 or 500", async () => {
    stubRequest({ status: 401, response: {} });
    await expect(
      FIUBAUsersApi.authenticate(validCredentials)
    ).rejects.toThrowErrorWithMessage(
      AuthenticateUnknownError,
      AuthenticateUnknownError.buildMessage({})
    );
  });
});
