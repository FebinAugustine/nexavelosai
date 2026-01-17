import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteAccountDto {
  @IsNotEmpty({ message: 'Confirmation text is required' })
  @IsString({ message: 'Confirmation text must be a string' })
  @IsIn(['DELETE'], { message: 'Confirmation text must be exactly "DELETE"' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  confirmation: string;
}