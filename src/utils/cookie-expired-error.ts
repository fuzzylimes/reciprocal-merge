export class CookieExpiredError extends Error {
  constructor(message: string = "Session cookie has expired. Please log in again to get a new cookie.") {
    super(message);
    this.name = "CookieExpiredError";

    // This line is needed for proper instanceof checks in TypeScript
    Object.setPrototypeOf(this, CookieExpiredError.prototype);
  }
}
