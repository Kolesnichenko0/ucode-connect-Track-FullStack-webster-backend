// src/core/unsplash/unsplash.module.ts
import { Module } from '@nestjs/common';
import { UnsplashService } from './unsplash.service';

@Module({
  providers: [UnsplashService],
  exports: [UnsplashService],
})
export class UnsplashModule {}
