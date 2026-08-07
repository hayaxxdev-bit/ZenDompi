import type { ID } from "../types";

/**
 * DTO untuk response user
 */
export type UserResponseDTO = {
  id: ID;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  telegramId: number | null;
  image: string | null;
};

/**
 * DTO untuk update profil
 */
export type UpdateProfileDTO = {
  name?: string;
  email?: string;
};