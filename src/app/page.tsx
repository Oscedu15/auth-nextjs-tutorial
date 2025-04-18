import { SignOut } from "@/components/sign-out";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth();
  //El auth es un middleware que se encarga de verificar si existe una sesion.
  if (!session) redirect("/sign-in");
  //Si no existe una sesion, redirige a la pagina de inicio de sesion.
  return (
    <>
      <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
        <p className="text-gray-600">Signed in as:</p>
        <p className="font-medium">TODO</p>
        <img
          className="rounded-full w-20 mx-auto h-20"
          src={session.user?.image}
          alt="avatar"
        />
        <h2>{session.user?.email}</h2>
        <h3>{session.user?.name}</h3>
        <p>{session.user?.id}</p>
      </div>

      <SignOut />
    </>
  );
};

export default Page;
