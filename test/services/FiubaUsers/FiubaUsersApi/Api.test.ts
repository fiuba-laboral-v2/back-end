import fetchMock from "fetch-mock";
import {
  AuthenticateFaultError,
  AuthenticateUnknownError,
  FiubaUsersApi
} from "$services/FiubaUsers";
import { FiubaUsersServiceConfig } from "$config/services";
import { RequestBodyMock } from "./RequestBodyMock";
import { parse } from "fast-xml-parser";

const invalidCredentials = {
  username: "badUsername",
  password: "badPassword"
};

const validCredentials = {
  username: "goodUsername",
  password: "goodPassword"
};

const stubRequest = ({ status, response }: { status: number; response: string }) =>
  fetchMock.mock(
    {
      url: FiubaUsersServiceConfig.url,
      method: "POST",
      headers: FiubaUsersApi.headers()
    },
    {
      status: status,
      body: response
    }
  );

describe("FiubaUsersApi", () => {
  afterEach(() => fetchMock.restore());

  it("returns false if the credentials are incorrect", async () => {
    const { authenticateSuccessResponse } = RequestBodyMock;
    const isValid = false;
    stubRequest({ status: 200, response: authenticateSuccessResponse({ isValid }) });
    expect(
      await FiubaUsersApi.authenticate(invalidCredentials)
    ).toBe(isValid);
  });

  it("returns true if the credentials are correct", async () => {
    const { authenticateSuccessResponse } = RequestBodyMock;
    const isValid = true;
    stubRequest({ status: 200, response: authenticateSuccessResponse({ isValid }) });
    expect(
      await FiubaUsersApi.authenticate(validCredentials)
    ).toBe(isValid);
  });

  it("throws an error if the request body has an invalid format", async () => {
    const errorMessage = "error in msg parsing: XML error parsing SOAP payload on line 1: required";
    stubRequest({
      status: 500,
      response: RequestBodyMock.authenticateErrorResponse(errorMessage)
    });
    await expect(
      FiubaUsersApi.authenticate(validCredentials)
    ).rejects.toThrowErrorWithMessage(Error, errorMessage);
  });

  it("throws error if the requested operation is not defined", async () => {
    const responseError = RequestBodyMock.authenticateErrorResponse(
      "Operation UNDEFINED_OPERATION is not defined in the WSDL for this service"
    );
    stubRequest({
      status: 500,
      response: responseError
    });
    await expect(
      FiubaUsersApi.authenticate(validCredentials)
    ).rejects.toThrowErrorWithMessage(
      AuthenticateFaultError,
      AuthenticateFaultError.buildMessage(parse(responseError))
    );
  });

  it("throws unknown error if status code is different from 200 or 500", async () => {
    stubRequest({ status: 401, response: "" });
    await expect(
      FiubaUsersApi.authenticate(validCredentials)
    ).rejects.toThrowErrorWithMessage(
      AuthenticateUnknownError,
      AuthenticateUnknownError.buildMessage(parse(""))
    );
  });
});