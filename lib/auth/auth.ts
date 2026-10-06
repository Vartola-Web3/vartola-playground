import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { authConfig } from './auth.config';
import { mfaState, requiresMfa, verifyLoginCode } from './mfa';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password, totp } = credentials as {
          email: string;
          password: string;
          totp?: string;
        };

        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });

        if (!user || !user.isActive) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        // Alpha administrators need a second factor. Someone who has not enrolled yet may sign in, but is limited to
        // the security page until they enrol (the middleware enforces that).
        let mfaEnrollment = false;
        if (requiresMfa(user.role)) {
          const state = await mfaState(user.id);
          if (state.enrolled) {
            if (!totp || !(await verifyLoginCode(user.id, totp))) return null;
          } else {
            mfaEnrollment = true;
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mfaEnrollment,
        };
      },
    }),
  ],
});
