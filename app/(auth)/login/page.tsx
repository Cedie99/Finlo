"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as Resolver<LoginInput>,
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#b4f03a]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#b4f03a]" />
          Sign in
        </span>
        <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight text-white">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-white/50">
          Continue managing your installments and monthly cash flow.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white/50">Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 rounded-xl border-white/[0.07] bg-[#0a0a0f] text-white placeholder:text-white/20 focus-visible:border-[#b4f03a] focus-visible:ring-[#b4f03a]/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white/50">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl border-white/[0.07] bg-[#0a0a0f] text-white placeholder:text-white/20 focus-visible:border-[#b4f03a] focus-visible:ring-[#b4f03a]/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="mt-2 h-12 w-full rounded-full bg-[#b4f03a] font-bold text-[#0c0c10] shadow-[0_8px_24px_rgba(180,240,58,0.25)] transition-colors hover:bg-[#ccff52] disabled:opacity-60"
            >
              {form.formState.isSubmitting ? (
                "Signing in..."
              ) : (
                <span className="inline-flex items-center gap-2">
                  Sign in <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>
        </Form>
      </div>

      <p className="mt-6 text-center text-sm text-white/50">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#b4f03a] hover:text-[#ccff52]">
          Create one free
        </Link>
      </p>
    </div>
  );
}
