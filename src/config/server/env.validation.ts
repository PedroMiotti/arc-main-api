import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  ENVIRONMENT: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET_KEY: string;
  @IsString()
  JWT_EXPIRE_TIME: string;
  @IsString()
  JWT_REFRESH_SECRET_KEY: string;
  @IsString()
  JWT_REFRESH_EXPIRE_TIME: string;
  @IsString()
  ENCRYPTION_SALT_ROUNDS: string;


  constructor(
    env: Environment,
    port: number,
    dbUrl: string,
    jwtSecretKey: string,
    jwtExpireTime: string,
    jwtRefreshSecretKey: string,
    jwtRefreshExpireTime: string,
    encryptionSaltRounds: string,
  ) {
    this.ENVIRONMENT = env;
    this.PORT = port;
    this.DATABASE_URL = dbUrl;
    this.JWT_SECRET_KEY = jwtSecretKey;
    this.JWT_EXPIRE_TIME = jwtExpireTime;
    this.JWT_REFRESH_SECRET_KEY = jwtRefreshSecretKey;
    this.JWT_REFRESH_EXPIRE_TIME = jwtRefreshExpireTime;
    this.ENCRYPTION_SALT_ROUNDS = encryptionSaltRounds;
  }
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
