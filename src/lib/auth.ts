// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { v4 as uuid } from "uuid";
//uuid es una libreria que permite generar un id unico para cada sesion
//v4 es un metodo de uuid que genera un id aleatorio
import GitHub from "next-auth/providers/github";
import db from "./db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { schema } from "./schema";
import { encode } from "next-auth/jwt";

//Archvio creado para configurar la autenticacion con github y el manejo de sesiones.

const adapter = PrismaAdapter(db);
//Adaptador de Prisma para NextAuth, permite utilizar la base de datos de Prisma como almacenamiento para las sesiones y usuarios.
export const { auth, handlers, signIn } = NextAuth({
  adapter,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        //! Validar las credenciales utilizando Zod
        const validatedCredentials = schema.parse(credentials);
        //utilizando un método de autenticación basado en credenciales
        //En este caso se utiliza un usuario y contraseña de ejemplo
        const user = await db.user.findFirst({
          where: {
            email: validatedCredentials.email,
            password: validatedCredentials.password,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credential = true;
      }
      return token;
    },
  },

  jwt: {
    encode: async function (params) {
      if (params.token?.credential) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No use ID found in token");
        }

        const createdSession = await adapter.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30Dias
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }
        return sessionToken;
      }
      return encode(params);
    },
  },
});
