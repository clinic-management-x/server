export interface Payload {
    sub: string;
    username: string;
    email: string;
    nonce: string;
    iat: number;
    exp: number;
}
