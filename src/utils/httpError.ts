export class BadRequestError extends Error {
    status: number;

    constructor (message: string) {
        super(message);
        this.status = 400;
    }
}

export class NotFoundError extends Error {
    status: number;

    constructor (message: string) {
        super(message);
        this.status = 404;
    }
}

export class UnauthorizedError extends Error {
    status: number;

    constructor () {
        super("Unauthorized");
        this.status = 401;
    }
}

export class ForbiddenError extends Error {
    status: number;

    constructor () {
        super("Forbidden");
        this.status = 403;
    }
}