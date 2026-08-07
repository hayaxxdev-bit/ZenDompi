import { ZenDompiError } from "./base.error";

/**
 * Validation error — untuk input yang tidak valid
 */
export class ValidationError extends ZenDompiError {
  public readonly fields?: Record<string, string>;

  constructor(
    message: string,
    fields?: Record<string, string>,
    details?: unknown
  ) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
    this.fields = fields;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.fields && { fields: this.fields }),
    };
  }
}