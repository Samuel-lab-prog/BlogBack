type AppErrorType = {
    errors?: string[];
    statusCode: number;
    message: string;
};

export default class AppError extends Error {
    errors: string[] | undefined;
    statusCode: number;
    constructor(props: AppErrorType) {
        super(props.message);
        this.statusCode = props.statusCode;
        this.errors = props.errors;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}