import { SetMetadata } from '@nestjs/common';

export const IS_DEV_KEY = 'devOnly';
export const DevOnly = () => SetMetadata(IS_DEV_KEY, true);
