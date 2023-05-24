import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_AUTH_ID,
        clientSecret: process.env.GOOGLE_AUTH_SECRET,
       }),
       GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET
      }),
  ],
}
export default NextAuth(authOptions)