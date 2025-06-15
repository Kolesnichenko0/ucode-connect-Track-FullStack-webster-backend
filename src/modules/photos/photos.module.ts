import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { UnsplashService } from '../../core/unsplash/unsplash.service';
import { PollinationsService } from './pollinations.service';

@Module({
    controllers: [PhotosController],
    providers: [UnsplashService, PollinationsService],
    exports: [UnsplashService, PollinationsService]
})
export class PhotosModule {}
