import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email public_repo",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      try {
        await connectDB();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            $set: {
              email: user.email,
              name: user.name,
              image: user.image ?? undefined,
              ...(account?.provider === "github" && {
                githubId: account.providerAccountId,
                githubAccessToken: account.access_token,
              }),
            },
          },
          { upsert: true, new: true }
        );
        return true;
      } catch {
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email }).lean();
          if (dbUser) {
            token.id = dbUser._id.toString();
          }
        } catch {
          // ignore
        }
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; email?: string }).id = token.id as string;
        (session.user as { id?: string; email?: string }).email = token.email as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret:
    process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_SECRET !== "your-random-secret-at-least-32-chars"
      ? process.env.NEXTAUTH_SECRET
      : process.env.NODE_ENV === "development"
        ? "dev-secret-replace-with-openssl-rand-base64-32"
        : undefined,
};
