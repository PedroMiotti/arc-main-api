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
  SERVICE_URL: string;

  @IsString()
  DATABASE_URL: string;

  constructor(
    env: Environment,
    port: number,
    serviceUrl: string,
    dbUrl: string,
  ) {
    this.ENVIRONMENT = env;
    this.PORT = port;
    this.SERVICE_URL = serviceUrl;
    this.DATABASE_URL = dbUrl;
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
