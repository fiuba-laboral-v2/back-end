import * as chai from "chai";
import chaiHttp from "chai-http";
import app from "../../src/index";

const server = app.listen();

chai.use(chaiHttp);

it("gets a 200 status from '/'", (done) => {
  chai.request(server)
    .get("/")
    .end((err, res) => {
      res.should.have.status(200);
      done();
    });
});
