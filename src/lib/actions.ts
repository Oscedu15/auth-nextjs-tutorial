import db from "./db";
import { executeAction } from "./executeAction";
import { schema } from "./schema";

const signUp = async (FormData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const email = FormData.get("email");
      const password = FormData.get("password");
      const validatedData = schema.parse({ email, password });
      await db.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          password: validatedData.password,
        },
      });
    },
  });
};

export { signUp };
