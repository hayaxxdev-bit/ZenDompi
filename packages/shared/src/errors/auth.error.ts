import { ZenDompiError } from "./base.error";

/**
 * Authentication error
 */
export class AuthError extends ZenDompiError {
  constructor(
    message: string,
    code: "UNAUTHORIZED" | "FORBIDDEN" | "OTP_INVALID" | "OTP_EXPIRED" | "USER_NOT_FOUND" = "UNAUTHORIZED",
    details?: unknown
  ) {
    const statusCodes: Record<string, number> = {
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      OTP_INVALID: 400,
      OTP_EXPIRED: 400,
      USER_NOT_FOUND: 404,
    };

    super(message, code, statusCodes[code] || 401, details);
    this.name = "AuthError";
  }
}