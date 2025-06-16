// src/core/users/dto/create-user-from-external-provider.dto.ts
import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateUserFromExternalProviderDto extends OmitType(CreateUserDto, [
    'password',
] as const) {}
