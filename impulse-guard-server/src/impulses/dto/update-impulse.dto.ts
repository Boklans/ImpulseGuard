import { PartialType } from '@nestjs/mapped-types';
import { CreateImpulseDto } from './create-impulse.dto';

export class UpdateImpulseDto extends PartialType(CreateImpulseDto) {}
