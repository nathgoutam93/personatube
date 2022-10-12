import { ModelInit, MutableModel } from "@aws-amplify/datastore";

export declare class S3object {
  readonly bucket: string;
  readonly region: string;
  readonly key: string;
  constructor(init: ModelInit<S3object>);
}

export declare class State {
  readonly name?: string | null;
  readonly cm_oe: S3object;
  readonly cm_ce: S3object;
  readonly om_oe: S3object;
  readonly om_ce?: S3object | null;
  readonly hotkey?: string | null;
  constructor(init: ModelInit<State>);
}

type CharacterMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Character {
  readonly id: string;
  readonly name?: string | null;
  readonly states: State;
  readonly owner: User;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly characterOwnerId: string;
  constructor(init: ModelInit<Character, CharacterMetaData>);
  static copyOf(source: Character, mutator: (draft: MutableModel<Character, CharacterMetaData>) => MutableModel<Character, CharacterMetaData> | void): Character;
}

export declare class User {
  readonly id: string;
  readonly username: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}