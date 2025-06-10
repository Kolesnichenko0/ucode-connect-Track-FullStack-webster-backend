// src/core/projects/projects.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpStatus,
    ParseIntPipe,
    UploadedFiles,
    UseInterceptors, HttpCode, ParseUUIDPipe, Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
    ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectFilesResponseDto } from './dto/project-files-response.dto';
import { CopyProjectResponseDto } from './dto/copy-project-response.dto';
import { Project } from './entities/project.entity';
import { ProjectOwnerGuard } from './guards/project-owner.guard';
import { UserId } from '../../common/decorators';
import { UploadFileSizeValidator, UploadFileTypeValidator } from '../../core/file-upload/validators';
import {
    UPLOAD_ALLOWED_FILE_EXTENSIONS,
    UPLOAD_ALLOWED_FILE_MIME_TYPES, UPLOAD_ALLOWED_MAX_FILE_SIZES,
} from '../../core/file-upload/constants/file-upload.contsants';
import { ParseFilesPipe } from '../../common/pipes/parse-files.pipe';
import { CanCopyProjectGuard } from './guards/can-copy-project.guard';
import { GetTemplatesDto } from './dto/get-templates.dto';
import { CursorPaginationResult, ProjectCursor } from '../../common/pagination/cursor';
import { AfterCursorQueryParseInterceptor } from '../../common/interceptors/after-cursor.interceptor';

@Controller('projects')
@ApiTags('Projects')
@ApiBearerAuth()
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get('templates')
    @UseInterceptors(AfterCursorQueryParseInterceptor)
    @ApiOperation({ summary: 'Get all system templates' })
    @ApiQuery({
        name: 'page',
        type: 'number',
        description: 'Page number',
        example: 1,
        required: false,
    })
    @ApiQuery({
        name: 'limit',
        type: 'number',
        description: 'Items per page',
        example: 10,
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'System templates successfully retrieved',
        schema: {
            type: 'object',
            properties: {
                projects: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Project' },
                },
                total: { type: 'number', example: 25 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
    })
    async findAllTemplates(
        @Query() query: GetTemplatesDto,
    ): Promise<CursorPaginationResult<Project, ProjectCursor>> {
        return this.projectsService.findAllTemplates(query);
    }

    @Get(':id')
    @UseGuards(ProjectOwnerGuard)
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Project ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Project successfully retrieved',
        type: Project,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
    })
    async findById(@Param('id') id: number): Promise<Project> {
        return this.projectsService.findById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new project' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Project successfully created',
        type: Project,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid project data',
    })
    async create(
        @Body() createProjectDto: CreateProjectDto,
        @UserId() userId: number,
    ): Promise<Project> {
        return this.projectsService.create(createProjectDto, userId);
    }

    @Patch(':id')
    @UseGuards(ProjectOwnerGuard)
    @ApiOperation({ summary: 'Update project' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Project ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Project successfully updated',
        type: Project,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
    })
    async update(
        @Param('id') id: number,
        @Body() updateProjectDto: UpdateProjectDto,
        @UserId() userId: number,
    ): Promise<Project> {
        return this.projectsService.update(id, updateProjectDto, userId);
    }

    @Delete(':id')
    @UseGuards(ProjectOwnerGuard)
    @ApiOperation({ summary: 'Delete project' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Project ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Project successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Project deleted successfully',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
    })
    async remove(
        //TODO: Do test with project assets
        @Param('id') id: number,
    ): Promise<{ message: string }> {
        await this.projectsService.delete(id);
        return { message: 'Project deleted successfully' };
    }

    @Get(':id/files')
    @UseGuards(ProjectOwnerGuard)
    @ApiOperation({ summary: 'Get all project files URLs' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Project ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Project files successfully retrieved',
        type: ProjectFilesResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
    })
    async getProjectFiles(
        @Param('id') id: number,
    ): Promise<ProjectFilesResponseDto> {
        return this.projectsService.getProjectAssetsFiles(id);
    }

    @Post(':id/files')
    @UseGuards(ProjectOwnerGuard)
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Add files to project' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Project ID',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Files successfully added to project',
        type: ProjectFilesResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid files or project data',
    })
    async addFilesToProject(
        @Param('id') id: number,
        @UploadedFiles(
            new ParseFilesPipe({
                maxCount: 10,
                optional: false,
                validators: [UploadFileTypeValidator, UploadFileSizeValidator],
                optionsForEachValidator: [
                    {
                        allowedMimeTypes: [
                            ...UPLOAD_ALLOWED_FILE_MIME_TYPES.PROJECT_ASSET,
                        ],
                        allowedExtensions: [
                            ...UPLOAD_ALLOWED_FILE_EXTENSIONS.PROJECT_ASSET,
                        ],
                    },
                    {
                        maxSize: UPLOAD_ALLOWED_MAX_FILE_SIZES.PROJECT_ASSET,
                    },
                ],
            }),
        )
        files: Express.Multer.File[],
        @UserId() userId: number,
    ): Promise<ProjectFilesResponseDto> {
        return this.projectsService.addFilesToProject(id, files, userId);
    }

    @Post(':id/copy')
    @UseGuards(ProjectOwnerGuard)
    @UseGuards(CanCopyProjectGuard)
    @ApiOperation({ summary: 'Copy project' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Project ID to copy',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Project successfully copied',
        type: CopyProjectResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
    })
    async copyProject(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<CopyProjectResponseDto> {
        return this.projectsService.copy(id, userId);
    }

    @Delete(':id/files/:fileKey')
    @UseGuards(ProjectOwnerGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary:
            'Remove an asset from a project and replace it with a default placeholder',
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'Project ID',
        example: 1,
    })
    @ApiParam({
        name: 'fileKey',
        type: 'string',
        description: 'File key (UUID v4) of the project asset to remove',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Asset successfully removed and project updated',
        type: Project,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project or File not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid UUID format for fileKey',
    })
    async removeAssetFromProject(
        @Param('id', ParseIntPipe) projectId: number,
        @Param('fileKey', new ParseUUIDPipe({ version: '4' }))
        fileKeyToRemove: string,
        @UserId() userId: number,
    ): Promise<Project> {
        return this.projectsService.removeAssetAndUpdateContent(
            projectId,
            fileKeyToRemove,
            userId,
        );
    }
}
