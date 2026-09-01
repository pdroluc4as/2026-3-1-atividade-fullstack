import Link from "next/link";

import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Acesso
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Entre para acessar o painel da aplicação.
        </p>

        <LoginForm />

        <p className="mt-5 text-center text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-slate-900 underline"
          >
            Cadastre-se
          </Link>
        </p>
      </section>
    </div>
  );
}
