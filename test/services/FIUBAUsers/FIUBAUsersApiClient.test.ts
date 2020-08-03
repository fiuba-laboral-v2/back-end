import fetchMock from "fetch-mock";
import { RequestBodyBuilder, FIUBAUsersApi } from "../../../src/services/FIUBAUsers";
import { AuthenticateFaultError, AuthenticateUnknownError } from "../../../src/services/FIUBAUsers";
import { FiubaUsersServiceConfig } from "../../../src/config";
import { RequestBodyBuilderMock } from "./RequestBodyBuilderMock";

const invalidCredentials = {
  username: "badUsername",
  password: "badPassword"
};

const validCredentials = {
  username: "goodUsername",
  password: "goodPassword"
};

const mockRequestBody = (mockEnvelop: string) => {
  jest.spyOn(RequestBodyBuilder, "buildAuthenticate").mockReturnValue(mockEnvelop);
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
    const { authenticateSuccessResponse } = RequestBodyBuilderMock;
    const isValid = false;
    stubRequest({ status: 200, response: authenticateSuccessResponse({ isValid }) });
    expect(
      await FIUBAUsersApi.authenticate(invalidCredentials)
    ).toBe(isValid);
  });

  it("returns true if the credentials are correct", async () => {
    const { authenticateSuccessResponse } = RequestBodyBuilderMock;
    const isValid = true;
    stubRequest({ status: 200, response: authenticateSuccessResponse({ isValid }) });
    expect(
      await FIUBAUsersApi.authenticate(validCredentials)
    ).toBe(isValid);
  });

  it("throws an error if the request body has an invalid format", async () => {
    mockRequestBody(RequestBodyBuilderMock.authenticateInvalidFormatRequest(validCredentials));
    const errorMessage = "error in msg parsing: XML error parsing SOAP payload on line 1: required";
    stubRequest({
      status: 500,
      response: RequestBodyBuilderMock.authenticateErrorResponse(errorMessage)
    });
    await expect(
      FIUBAUsersApi.authenticate(validCredentials)
    ).rejects.toThrowErrorWithMessage(Error, errorMessage);
  });

  it("throws error if the requested operation is not defined", async () => {
    const { authenticateUndefinedOperationRequest } = RequestBodyBuilderMock;
    mockRequestBody(authenticateUndefinedOperationRequest(validCredentials));
    const responseError = RequestBodyBuilderMock.authenticateErrorResponse(
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
