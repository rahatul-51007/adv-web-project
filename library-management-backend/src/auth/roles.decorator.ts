import { SetMetadata } from '@nestjs/common';

import { Users, Role } from './../users/users.entity';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);