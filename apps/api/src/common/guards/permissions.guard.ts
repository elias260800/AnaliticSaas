import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No restrictions
    }

    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (!user || !user.permissions) {
      throw new ForbiddenException('No tiene permisos asignados');
    }

    const hasPermission = requiredPermissions.every((perm) =>
      user.permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permisos requeridos: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
