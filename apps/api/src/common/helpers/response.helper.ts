type Code = "AUTH_FAILED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "SERVER_ERROR";

type ResponseBody = {
    success: boolean;
    data: any | null;
    message: string;
    code?: Code;
    status: number;
};

type Options = {
    message?: string;
    status?: number;
    code?: Code;
};

export class ResponseHelper {
    static success(data: any, options: Options = {}): Response {
        const { message = "OK", status = 200, code } = options;
        const body: ResponseBody = { success: true, data, message, status, code };
        return Response.json(body, { status });
    }

    static error(message: string, options: Options = {}): Response {
        const { status = 500, code = "SERVER_ERROR" } = options;
        const body: ResponseBody = { success: false, data: null, message, status, code };
        return Response.json(body, { status });
    }
}
