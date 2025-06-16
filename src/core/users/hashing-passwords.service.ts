// src/core/users/passwords.service.ts
import { Injectable } from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { HashType} from '../hashing/hashing.enums';


@Injectable()
export class HashingPasswordsService {
    constructor(private hashingService: HashingService) { }

    async hash(plainPassword: string): Promise<string> {
        return this.hashingService.hash(plainPassword, HashType.PASSWORD);
    }

    async compare(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return this.hashingService.compare(plainPassword, hashedPassword);
    }
}
