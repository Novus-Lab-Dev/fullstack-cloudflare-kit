export type User = {
    sub: string;
    role: string;
    permissions?: string[];
    exp: number;
};
