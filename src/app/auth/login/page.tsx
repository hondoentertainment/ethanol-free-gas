import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-sm text-zinc-500">Loading sign-in…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
