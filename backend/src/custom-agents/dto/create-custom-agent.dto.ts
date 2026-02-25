import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomAgentDto {
  @IsNotEmpty({ message: 'Agent name is required' })
  @IsString({ message: 'Agent name must be a string' })
  @MaxLength(100, { message: 'Agent name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message:
      'Agent name can only contain letters, numbers, spaces, hyphens, and underscores',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(50000, {
    message: 'Description must not exceed 50,000 characters',
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const trimmedValue = value.trim();
    const wordCount = trimmedValue
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
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
  @IsIn(['gemini', 'chatgpt', 'openrouter', 'custom'], {
    message: 'Provider must be one of: gemini, chatgpt, openrouter, custom',
  })
  provider: string;

  @IsNotEmpty({ message: 'Model is required' })
  @IsString({ message: 'Model must be a string' })
  @MaxLength(200, { message: 'Model name must not exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  model: string;

  @IsOptional()
  @IsString({ message: 'Domain must be a string' })
  @MaxLength(200, { message: 'Domain must not exceed 200 characters' })
  @Matches(
    /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\/.*)?$/,
    {
      message: 'Domain must be a valid URL or domain name',
    },
  )
  @Transform(({ value }) => value?.trim())
  domain?: string;

  @IsOptional()
  configuration?: Record<string, any>;

  @IsOptional()
  leadCapture?: {
    enabled: boolean;
    trigger: 'time' | 'messageCount';
    triggerValue: number;
    formFields: Array<{
      name: string;
      label: string;
      type: 'text' | 'email' | 'phone' | 'textarea';
      required: boolean;
      placeholder?: string;
    }>;
  };
}
