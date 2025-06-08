// src/core/files/dto/create-file.dto.ts
import { IsId } from 'src/common/validators';

export class UpdateFileDto {
  @IsId(true)
  targetId?: number;
}
