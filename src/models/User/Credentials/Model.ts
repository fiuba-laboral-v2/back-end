import { User } from "$models";

export abstract class Credentials {
  protected user: User;

  constructor(user: User) {
    this.user = user;
  }

  public abstract validate(): void;
}
