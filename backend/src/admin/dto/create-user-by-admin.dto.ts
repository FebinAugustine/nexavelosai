import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateUserByAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string = 'user';

  @IsOptional()
  @IsEnum(['free', 'regular', 'special', 'agency'])
  plan?: string = 'free';

  @IsOptional()
  @IsNumber()
  @Min(-1) // -1 for unlimited
  agentLimit?: number = 1;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({ require_tld: false, protocols: ['http', 'https'] }, { each: true }) // Validate each domain as a URL
  domains?: string[];
}
