import { User } from "$models";

export abstract class Credentials {
  public abstract validate(user: User): void;
}
