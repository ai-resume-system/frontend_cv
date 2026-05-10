import Image from "next/image";
import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/Button";
import { ROUTES } from "@/shared/constants/constants/routes";
import { messages } from "@/shared/i18n/config";
import { cn } from "@/shared/lib/utils/cn";

interface AuthShellProps {
  children: ReactNode;
  reverse?: boolean;
}

export function AuthShell({ children, reverse = false }: AuthShellProps) {
  const t = messages.auth.brand;

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section
        className={cn(
          "flex min-h-[36vh] flex-col justify-between bg-primary p-6 text-white sm:p-10",
          reverse && "lg:order-2",
        )}
      >
        <Button
          className="w-fit bg-white text-primary hover:bg-primary-soft"
          href={ROUTES.HOME}
        >
          {messages.common.actions.backHome}
        </Button>
        <div className="max-w-xl py-12">
          <div className="mb-8 grid h-20 w-20 place-items-center rounded-2xl bg-white p-2">
            <Image
              alt={messages.common.appName}
              className="h-full w-full object-contain"
              height={80}
              priority
              src="/logo.png"
              width={80}
            />
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-white/80">
            {t.description}
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </section>
    </main>
  );
}
