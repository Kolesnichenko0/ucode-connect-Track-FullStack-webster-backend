// src/core/external-accounts/external-accounts.controller.ts
import {
    Controller,
    Delete,
    Param,
    UseGuards,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ExternalAccountsService } from './external-accounts.service';
import { ExternalAccountOwnerGuard } from './guards/external-account-owner.guard';

@Controller('external-accounts')
@ApiTags('External Accounts')
export class ExternalAccountsController {
    constructor(
        private readonly externalAccountsService: ExternalAccountsService,
    ) {}

    @Delete(':id')
    @UseGuards(ExternalAccountOwnerGuard)
    @ApiOperation({ summary: 'Delete external account and revoke tokens' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'External account identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Successfully deleted external account',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'External account not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'External account not found.',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Cannot delete last authentication method',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example:
                        'Cannot unlink the only authentication method. Please set a password for your account first.',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Unprocessable Entity',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 422,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'You can only delete your own external accounts',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Forbidden',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 403,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.externalAccountsService.delete(id, true);
    }
}
