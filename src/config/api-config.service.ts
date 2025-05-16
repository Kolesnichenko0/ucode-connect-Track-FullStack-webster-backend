// src/config/api-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env, FieldKeyType, FieldType, IConfig } from '../config/config.interface';

@Injectable()
export class ApiConfigService {
  constructor(private readonly cs: ConfigService<IConfig>) { }

  public getEnv() {
    return this.get('app.env');
  }

  public isDevelopment(): boolean {
    return this.getEnv() === Env.DEVELOPMENT;
  }

  public isProduction(): boolean {
    return this.getEnv() === Env.PRODUCTION;
  }

  public isTest(): boolean {
    return this.getEnv() === Env.TEST;
  }
  
  public get<T extends FieldKeyType<IConfig>>(key: T): FieldType<IConfig, T> {
    // For simple keys without nesting
    if (!key.includes('.')) {
      const value = this.cs.get<any>(key, { infer: true });
      if (value === undefined) throw new Error(`Variable "${key}" not defined`);
      return value;
    }
    
    // For nested keys, we parse them manually
    const parts = key.split('.');
    const rootKey = parts[0];
    const rootValue = this.cs.get<any>(rootKey, { infer: true });
    
    if (rootValue === undefined) throw new Error(`Variable "${rootKey}" not defined`);
    
    let result = rootValue;
    
    for (let i = 1; i < parts.length; i++) {
      if (result === undefined || result === null) {
        throw new Error(`Variable "${parts.slice(0, i).join('.')}" is undefined or null`);
      }
      
      result = result[parts[i]];
      
      if (result === undefined) {
        throw new Error(`Variable "${key}" not defined`);
      }
    }
    
    return result as FieldType<IConfig, T>;
  }
}


export const acs = new ApiConfigService(new ConfigService());
