import { PartialType } from '@nestjs/mapped-types';
import { CreateEggDto } from './create-egg.dto';

export class UpdateEggDto extends PartialType(CreateEggDto) {}
