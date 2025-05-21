import { RegisterInput } from '../../types/user.types';
import { GraphQLContext } from '../../types/context.types';
import { loginUser, registerUser } from '../../services/user.service';

export const userResolvers = {
  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }, ctx: GraphQLContext) => {
      return registerUser(input, ctx.prisma);
    },

    login: async (_: any, { email, password }: { email: string; password: string }, ctx: GraphQLContext) => {
      return loginUser(email, password, ctx.prisma);
    }
  }
};
