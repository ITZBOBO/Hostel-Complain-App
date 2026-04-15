import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Matric No / Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        const isStudentMatric = credentials.identifier.toUpperCase().startsWith('RUN/')

        if (isStudentMatric) {
          // ==========================================
          // MOCKED SCHOOL API INTEGRATION
          // ==========================================
          // This simulates hitting the school's endpoint.
          // Once the ICT admins provide the real API URL and method,
          // replace this block with an actual fetch() call.
          
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 800))

          const schoolApiPayload = {
            student: {
              name: "AGBOOLA ENOCH",
              matric: credentials.identifier.toUpperCase(),
              department: "Computer Science",
              level: "400",
              programme: "Computer Science",
              // Realistic looking fake face for the demo instead of plain placeholder
              photo: "https://i.pravatar.cc/200?u=agboola_enoch"
            }
          }

          // In a real API call, if authentication fails (wrong password),
          // the school API would return an error and we would: `return null`
          
          // Upsert the student in our local DB so they can interact with complaints natively
          const user = await db.user.upsert({
            where: { matricNo: schoolApiPayload.student.matric },
            update: {
              name: schoolApiPayload.student.name,
              department: schoolApiPayload.student.department,
              level: schoolApiPayload.student.level,
              programme: schoolApiPayload.student.programme,
              photo: schoolApiPayload.student.photo,
            },
            create: {
              matricNo: schoolApiPayload.student.matric,
              email: `${schoolApiPayload.student.matric.replace(/\//g, '')}@student.run.edu.ng`, // Dummy normalized email
              name: schoolApiPayload.student.name,
              password: await bcrypt.hash('MOCKED_API_PWD', 10), // Required field but won't be used for auth
              role: 'STUDENT',
              department: schoolApiPayload.student.department,
              level: schoolApiPayload.student.level,
              programme: schoolApiPayload.student.programme,
              photo: schoolApiPayload.student.photo,
            }
          })

          return { id: user.id, name: user.name, email: user.email, role: user.role }
        }

        // ==========================================
        // ADMIN / ARTISAN LOCAL LOGIN
        // ==========================================
        const user = await db.user.findFirst({
          where: {
            OR: [
              { matricNo: credentials.identifier },
              { email: credentials.identifier },
            ],
          },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
}
