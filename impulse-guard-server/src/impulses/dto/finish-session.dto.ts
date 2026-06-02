import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FinishSessionDto {
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsString()
  selectedPetId?: string;
}
