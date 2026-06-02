export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

export class LoginUserDto {
  email: string;
  password: string;
}
