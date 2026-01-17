import { IsNotEmpty, IsString, IsOptional, IsIn, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAgentDto {
  @IsNotEmpty({ message: 'Agent name is required' })
  @IsString({ message: 'Agent name must be a string' })
  @MaxLength(100, { message: 'Agent name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, { message: 'Agent name can only contain letters, numbers, spaces, hyphens, and underscores' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(50000, { message: 'Description must not exceed 50,000 characters' })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmedValue = value.trim();
    // Check word count
    const wordCount = trimmedValue.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 1000) {
      throw new Error('Description must not exceed 1000 words');
    }
    return trimmedValue;
  })
  description?: string;

  @IsNotEmpty({ message: 'API key is required' })
  @IsString({ message: 'API key must be a string' })
  @MaxLength(1000, { message: 'API key must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  apiKey: string;

  @IsNotEmpty({ message: 'Provider is required' })
  @IsString({ message: 'Provider must be a string' })
  @IsIn(['gemini', 'chatgpt', 'openrouter'], { message: 'Provider must be one of: gemini, chatgpt, openrouter' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  provider: string;

  @IsOptional()
  @IsString({ message: 'Domain must be a string' })
  @MaxLength(253, { message: 'Domain must not exceed 253 characters' })
  @Matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^$/, { message: 'Domain must be a valid domain format or empty' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  domain?: string;
}