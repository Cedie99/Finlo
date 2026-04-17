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
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2b59e8]">Sign in</p>
        <h1 className="font-heading text-3xl font-semibold text-[#111c36] mb-1.5">Welcome back</h1>
        <p className="text-[#5d6a89] text-sm">Continue managing your installments and monthly cash flow.</p>
      </div>

      <div className="rounded-[1.7rem] border border-[#d8dff5] bg-white/90 shadow-[0_18px_55px_rgba(45,78,175,0.12)] p-8 backdrop-blur-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#37476d] text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="rounded-xl border-[#d7def4] bg-white h-11 text-[#1b2a4d] placeholder:text-[#8a96b6] focus:border-[#4d77ff] focus:ring-[#4d77ff]/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#37476d] text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl border-[#d7def4] bg-white h-11 text-[#1b2a4d] placeholder:text-[#8a96b6] focus:border-[#4d77ff] focus:ring-[#4d77ff]/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-11 rounded-full bg-[#245bff] hover:bg-[#1a47cc] font-semibold text-sm shadow-[0_10px_28px_rgba(36,91,255,0.3)]"
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </div>

      <p className="text-center text-sm text-[#6d7b9e] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#245bff] hover:underline font-semibold">
          Create one free
        </Link>
      </p>
    </div>
  );
}
