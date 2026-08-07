import type { IEvent } from "../bus";

export const AuthEvents = {
  LOGIN: "UserLogin",
  REGISTER: "UserRegister",
  LOGOUT: "UserLogout",
} as const;

export type UserLoginPayload = {
  userId: string;
  telegramId: string;
  isNewUser: boolean;
};

export type UserRegisterPayload = {
  userId: string;
  telegramId: string;
  name: string | null;
};

export type UserLogoutPayload = {
  userId: string;
  telegramId: string;
};

export class UserLoginEvent implements IEvent<UserLoginPayload> {
  readonly eventName = AuthEvents.LOGIN;
  readonly timestamp = new Date();
  constructor(readonly payload: UserLoginPayload) {}
}

export class UserRegisterEvent implements IEvent<UserRegisterPayload> {
  readonly eventName = AuthEvents.REGISTER;
  readonly timestamp = new Date();
  constructor(readonly payload: UserRegisterPayload) {}
}

export class UserLogoutEvent implements IEvent<UserLogoutPayload> {
  readonly eventName = AuthEvents.LOGOUT;
  readonly timestamp = new Date();
  constructor(readonly payload: UserLogoutPayload) {}
}