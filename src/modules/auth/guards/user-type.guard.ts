import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private readonly allowedTypes: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !this.allowedTypes.includes(user.userType)) {
      throw new ForbiddenException('User type not allowed for this endpoint');
    }

    return true;
  }
}
