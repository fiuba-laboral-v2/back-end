import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../src/index";
import { OK } from "http-status-codes";

const server = app.listen();

chai.use(chaiHttp);

describe("Root", () => {
  it("gets a 200 status from '/'", (done) => {
    chai.request(server)
      .get("/")
      .end((err, res) => {
        chai.expect(res.status).to.equal(OK);
        done();
      });
  });
});
