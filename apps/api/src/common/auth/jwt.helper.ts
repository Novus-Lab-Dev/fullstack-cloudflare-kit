import { Context } from 'hono';
import { sign, verify } from 'hono/jwt'
import { AlgorithmTypes, type SignatureAlgorithm } from 'hono/utils/jwt/jwa'
import { Environment } from '../constants/env';
import type { User } from '../interfaces/user.interface';


export class JwtHelper {
    alg: SignatureAlgorithm = AlgorithmTypes.HS256;


    async sign<T extends User>(payload: T, c: Context) {
        const secret = Environment.getByContext('JWT_SECRET', c) || "";
        return sign(payload, secret, this.alg);
    }

    async verify(token: string, c: Context): Promise<User> {
        const secret = Environment.getByContext('JWT_SECRET', c) || "";
        return await verify(token, secret, { alg: this.alg }) as User;
    }
}
