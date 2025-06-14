import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { UnsplashService } from '../../core/unsplash/unsplash.service';

@Module({
    controllers: [PhotosController],
    providers: [UnsplashService],
    exports: [UnsplashService]
})
export class PhotosModule {}
