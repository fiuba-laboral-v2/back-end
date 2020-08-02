import { FIUBAUsers } from "../../../src/services/FIUBAUsers/Service";
import { Envelop } from "../../../src/services/FIUBAUsers/Envelop";
import fetchMock from "fetch-mock";
import { MockEnvelop } from "./MockEnvelop";

describe("FIUBAUsers", () => {
  afterEach(() => fetchMock.restore());
  const username = "username";
  const password = "password";

  const mockRequestEnvelop = (mockEnvelop: object) => {
    jest.spyOn(Envelop, "buildAuthenticate").mockReturnValue(mockEnvelop);
  };

  const stubRequest = ({ status, response }: { status: number; response: object }) =>
    fetchMock.mock(
      {
        url: "http://services.desarrollo.fi.uba.ar/usuarios.php",
        method: "POST",
        headers: FIUBAUsers.headers()
      },
      {
        status: status,
        body: response
      }
    );

  it("returns false if credentials are incorrect", async () => {
    stubRequest({ status: 200, response: MockEnvelop.AuthenticateSuccessResponse(false) });
    expect(
      await FIUBAUsers.authenticate("username", "password")
    ).toBe(false);
  });

  it("returns true if credentials are correct", async () => {
    stubRequest({ status: 200, response: MockEnvelop.AuthenticateSuccessResponse(true) });
    expect(
      await FIUBAUsers.authenticate("username", "password")
    ).toBe(true);
  });

  it("throws an error if the envelop has an invalid format", async () => {
    mockRequestEnvelop(MockEnvelop.AuthenticateInvalidFormatRequest(username, password));
    const errorMessage = "error in msg parsing: XML error parsing SOAP payload on line 1: required";
    stubRequest({
      status: 500,
      response: MockEnvelop.AuthenticateErrorResponse(errorMessage)
    });
    await expect(
      FIUBAUsers.authenticate("username", "password")
    ).rejects.toThrowErrorWithMessage(Error, errorMessage);
  });

  it("throws unknown error", async () => {
    mockRequestEnvelop(MockEnvelop.AuthenticateUndefinedOperationRequest(username, password));
    const errorMessage = "Operation UNDEFINED_OPERATION is not defined in the " +
      "WSDL for this service";
    stubRequest({
      status: 500,
      response: MockEnvelop.AuthenticateErrorResponse(errorMessage)
    });
    await expect(
      FIUBAUsers.authenticate("username", "password")
    ).rejects.toThrowErrorWithMessage(Error, errorMessage);
  });

  it("throws unknown error if status code is different from 200 or 500", async () => {
    stubRequest({ status: 401, response: {} });
    await expect(
      FIUBAUsers.authenticate("username", "password")
    ).rejects.toThrowErrorWithMessage(Error, "Unknown error:");
  });
});
