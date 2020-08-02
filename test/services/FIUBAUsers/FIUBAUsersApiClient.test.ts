import fetchMock from "fetch-mock";
import { FIUBAUsers, Envelop, FIUBAUsersApiClient } from "../../../src/services/FIUBAUsers";
import { FIUBAUsersConfig } from "../../../src/config";
import { MockEnvelop } from "./MockEnvelop";

const badCredentials = {
  username: "badUsername",
  password: "badPassword"
};

const goodCredentials = {
  username: "goodUsername",
  password: "goodPassword"
};

describe("FIUBAUsersApiClient", () => {
  afterEach(() => fetchMock.restore());

  const mockRequestEnvelop = (mockEnvelop: string) => {
    jest.spyOn(Envelop, "buildAuthenticate").mockReturnValue(mockEnvelop);
  };

  const stubRequest = ({ status, response }: { status: number; response: object }) =>
    fetchMock.mock(
      {
        url: FIUBAUsersConfig.url,
        method: "POST",
        headers: FIUBAUsersApiClient.headers()
      },
      {
        status: status,
        body: response
      }
    );

  it("returns false if the credentials are incorrect", async () => {
    stubRequest({ status: 200, response: MockEnvelop.AuthenticateSuccessResponse(false) });
    expect(
      await FIUBAUsers.authenticate(badCredentials)
    ).toBe(false);
  });

  it("returns true if the credentials are correct", async () => {
    stubRequest({ status: 200, response: MockEnvelop.AuthenticateSuccessResponse(true) });
    expect(
      await FIUBAUsers.authenticate(goodCredentials)
    ).toBe(true);
  });

  it("throws an error if the envelop has an invalid format", async () => {
    mockRequestEnvelop(MockEnvelop.AuthenticateInvalidFormatRequest(goodCredentials));
    const errorMessage = "error in msg parsing: XML error parsing SOAP payload on line 1: required";
    stubRequest({
      status: 500,
      response: MockEnvelop.AuthenticateErrorResponse(errorMessage)
    });
    await expect(
      FIUBAUsers.authenticate(goodCredentials)
    ).rejects.toThrowErrorWithMessage(Error, errorMessage);
  });

  it("throws error if the requested operation is not defined", async () => {
    mockRequestEnvelop(MockEnvelop.AuthenticateUndefinedOperationRequest(goodCredentials));
    const errorMessage = "Operation UNDEFINED_OPERATION is not defined in the " +
      "WSDL for this service";
    stubRequest({
      status: 500,
      response: MockEnvelop.AuthenticateErrorResponse(errorMessage)
    });
    await expect(
      FIUBAUsers.authenticate(goodCredentials)
    ).rejects.toThrowErrorWithMessage(Error, errorMessage);
  });

  it("throws unknown error if status code is different from 200 or 500", async () => {
    stubRequest({ status: 401, response: {} });
    await expect(
      FIUBAUsers.authenticate(goodCredentials)
    ).rejects.toThrowErrorWithMessage(Error, "Unknown error:");
  });
});
