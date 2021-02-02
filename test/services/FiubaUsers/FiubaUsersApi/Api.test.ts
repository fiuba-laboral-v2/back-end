import fetchMock, { MockResponseObject } from "fetch-mock";
import {
  AuthenticateFaultError,
  AuthenticateUnknownError,
  FiubaUsersApi,
  FiubaUsersServiceFetchError
} from "$services/FiubaUsers";
import { Environment } from "$config";
import { ResponseBodyMock } from "./ResponseBodyMock";
import { parse } from "fast-xml-parser";
import { DniGenerator } from "$generators/DNI";
import { FetchError } from "node-fetch";

const invalidCredentials = {
  dni: DniGenerator.generate(),
  password: "badPassword"
};

const validCredentials = {
  dni: DniGenerator.generate(),
  password: "goodPassword"
};

const stubRequest = (mockResponse: MockResponseObject) =>
  fetchMock.mock(
    {
      url: Environment.FiubaUsersApi.url(),
      method: "POST",
      headers: FiubaUsersApi.headers()
    },
    mockResponse
  );

describe("FiubaUsersApi", () => {
  beforeEach(() =>
    jest
      .spyOn(Environment.FiubaUsersApi, "url")
      .mockImplementation(() => "https://fiuba-users-api.com")
  );
  afterEach(() => fetchMock.restore());

  it("returns false if the credentials are incorrect", async () => {
    const { authenticateSuccessResponse } = ResponseBodyMock;
    const isValid = false;
    stubRequest({
      status: 200,
      body: authenticateSuccessResponse({ isValid })
    });
    expect(await FiubaUsersApi.authenticate(invalidCredentials)).toBe(isValid);
  });

  it("returns true if the credentials are correct", async () => {
    const { authenticateSuccessResponse } = ResponseBodyMock;
    const isValid = true;
    stubRequest({
      status: 200,
      body: authenticateSuccessResponse({ isValid })
    });
    expect(await FiubaUsersApi.authenticate(validCredentials)).toBe(isValid);
  });

  it("throws an error if the request body has an invalid format", async () => {
    const errorMessage = "error in msg parsing: XML error parsing SOAP payload on line 1: required";
    stubRequest({
      status: 500,
      body: ResponseBodyMock.authenticateErrorResponse(errorMessage)
    });
    await expect(FiubaUsersApi.authenticate(validCredentials)).rejects.toThrowErrorWithMessage(
      Error,
      errorMessage
    );
  });

  it("throws error if the requested operation is not defined", async () => {
    const responseError = ResponseBodyMock.authenticateErrorResponse(
      "Operation UNDEFINED_OPERATION is not defined in the WSDL for this service"
    );
    stubRequest({
      status: 500,
      body: responseError
    });
    await expect(FiubaUsersApi.authenticate(validCredentials)).rejects.toThrowErrorWithMessage(
      AuthenticateFaultError,
      AuthenticateFaultError.buildMessage(parse(responseError))
    );
  });

  it("throws error when the service is unavailable", async () => {
    stubRequest({
      status: 500,
      body: "unavailable"
    });
    await expect(FiubaUsersApi.authenticate(validCredentials)).rejects.toThrowErrorWithMessage(
      AuthenticateFaultError,
      AuthenticateFaultError.buildMessage(parse("unavailable"))
    );
  });

  it("throws unknown error if status code is different from 200 or 500", async () => {
    stubRequest({ status: 401, body: "" });
    await expect(FiubaUsersApi.authenticate(validCredentials)).rejects.toThrowErrorWithMessage(
      AuthenticateUnknownError,
      AuthenticateUnknownError.buildMessage(parse(""))
    );
  });

  it("throws an error if the service has a connection error", async () => {
    const error = new FetchError("message", "type");
    stubRequest({ throws: error });
    await expect(FiubaUsersApi.authenticate(validCredentials)).rejects.toThrowErrorWithMessage(
      FiubaUsersServiceFetchError,
      FiubaUsersServiceFetchError.buildMessage(error)
    );
  });
});
