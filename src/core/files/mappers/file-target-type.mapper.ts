import { FileTargetType } from '@prisma/client';

export class FileTargetTypeMapper {
    private static readonly TYPE_MAPPINGS: Record<FileTargetType, string> = {
        [FileTargetType.USER_AVATAR]: 'user-avatars',
        [FileTargetType.PROJECT_ASSET]: 'project-assets',
        [FileTargetType.PROJECT_PREVIEW]: 'project-previews',
        [FileTargetType.PROJECT_BACKGROUND]: 'project-backgrounds',
        [FileTargetType.PROJECT_ELEMENT]: 'project-elements',
        [FileTargetType.FONT_ASSET]: 'font-assets',
    };

    // Inverted mapping
    private static readonly CATEGORY_MAPPINGS: Record<string, FileTargetType> =
        Object.entries(FileTargetTypeMapper.TYPE_MAPPINGS)
            .reduce((acc, [type, category]) => {
                acc[category] = Number(type) as unknown as FileTargetType;
                return acc;
            }, {} as Record<string, FileTargetType>);

    static getCategory(targetType: FileTargetType): string | undefined {
        return FileTargetTypeMapper.TYPE_MAPPINGS[targetType];
    }

    static getTargetType(category: string): FileTargetType | undefined {
        return FileTargetTypeMapper.CATEGORY_MAPPINGS[category];
    }

    static getAllCategories(): string[] {
        return Object.values(FileTargetTypeMapper.TYPE_MAPPINGS);
    }

    static isValidCategory(category: string): boolean {
        return category in FileTargetTypeMapper.CATEGORY_MAPPINGS;
    }

    static mapTargetTypesToCategories(types: FileTargetType[]): string[] {
        return types
            .map(type => FileTargetTypeMapper.getCategory(type))
            .filter(Boolean) as string[];
    }
}
