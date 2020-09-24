import { Admin } from "$models";
import { AdminTask } from "$models/AdminTask";
import { ApolloServerTestClient } from "apollo-server-testing";
import { TestClientGenerator } from "$generators/TestClient";
import { Secretary } from "$models/Admin";
import { AdminGenerator } from "$generators/Admin";

export class AdminTestSetup {
  public graduadosApolloClient: ApolloServerTestClient;
  public extensionApolloClient: ApolloServerTestClient;
  public extensionAdmin: Admin;
  public graduadosAdmin: Admin;
  public graphqlSetup: boolean;
  public tasks: AdminTask[];

  constructor({ graphqlSetup }: { graphqlSetup: boolean }) {
    this.graphqlSetup = graphqlSetup;
  }

  public async execute() {
    if (this.graphqlSetup) {
      const extension = await TestClientGenerator.admin({ secretary: Secretary.extension });
      const graduados = await TestClientGenerator.admin({ secretary: Secretary.graduados });
      this.extensionAdmin = extension.admin;
      this.extensionApolloClient = extension.apolloClient;
      this.graduadosAdmin = graduados.admin;
      this.graduadosApolloClient = graduados.apolloClient;
    } else {
      this.extensionAdmin = await AdminGenerator.extension();
      this.graduadosAdmin = await AdminGenerator.graduados();
    }
  }
}
