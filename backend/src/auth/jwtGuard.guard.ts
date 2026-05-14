import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs/internal/Observable';



@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector:Reflector){
        super();
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
    validateRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw new UnauthorizedException('unauthorized request');
        }
        return user;
    }
}