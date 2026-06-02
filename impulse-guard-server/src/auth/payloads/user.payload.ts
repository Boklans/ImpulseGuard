import { UserDocument } from 'src/users/schema/user.schema';

export interface UserPayload {
  clerkPayload: {
    sub: string;
  };
  user: UserDocument;
  id: string;
}
