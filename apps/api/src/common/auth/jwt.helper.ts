import { Context } from 'hono';
import { sign, verify } from 'hono/jwt'
import { AlgorithmTypes, type SignatureAlgorithm } from 'hono/utils/jwt/jwa'
import { Environment } from '../constants/env';

type AppJWTPayload = {
    sub: string;
    role: string,
    exp: number,
};


export class JwtHelper {
    alg: SignatureAlgorithm = AlgorithmTypes.HS256;


    async sign<T extends AppJWTPayload>(payload: T, c: Context) {
        const secret = Environment.getByContext('JWT_SECRET', c) || "";
        return sign(payload, secret, this.alg);
    }

    async verify(token: string, c: Context) {
        const secret = Environment.getByContext('JWT_SECRET', c) || "";
        return verify(token, secret, { alg: this.alg });
    }
}
