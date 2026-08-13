export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
  tokenType: string = 'Bearer';
  userId!: string;
  userType!: 'customer' | 'commerce';
}
