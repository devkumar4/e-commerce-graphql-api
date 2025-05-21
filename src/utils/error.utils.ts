import { ERROR_MESSAGES } from "../constants/error.constants"

export class BaseError extends Error {
  code: string;
  additionalInfo: Record<string, any>;

  constructor(message: string, code: string, additionalInfo: Record<string, any> = {}) {
    super(message);
    this.code = code;
    this.additionalInfo = additionalInfo;
  }

  toGraphQLError() {
    return {
      message: this.message,
      extensions: {
        code: this.code,
        ...this.additionalInfo
      }
    };
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHENTICATED) {
    super(message, 'UNAUTHENTICATED');
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, 'FORBIDDEN');
  }
}

export class ValidationError extends BaseError {
  constructor(message: string = ERROR_MESSAGES.BAD_USER_INPUT, fields: Record<string, string>) {
    super(message, 'BAD_USER_INPUT', { fields });
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND');
  }
}
