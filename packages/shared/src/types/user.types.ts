import type { ID, Timestamp, Nullable } from "./common.types";

/**
 * User
 */
export type User = {
  id: ID;
  name: Nullable<string>;
  email: Nullable<string>;
  phoneNumber: Nullable<string>;
  telegramId: Nullable<number>;
  image: Nullable<string>;
  emailVerified: Nullable<Timestamp>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/**
 * User profile (public)
 */
export type UserProfile = Pick<User, "id" | "name" | "email" | "phoneNumber" | "telegramId" | "image">;

/**
 * Input untuk update profil
 */
export type UpdateProfileInput = {
  name?: string;
  email?: string;
};