"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterInput>,
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: RegisterInput) {
    setError(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Registration failed");
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2b59e8]">Register</p>
        <h1 className="font-heading text-3xl font-semibold text-[#111c36] mb-1.5">Create your account</h1>
        <p className="text-[#5d6a89] text-sm">Start tracking your finances with Finlo for free.</p>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#37476d] text-sm font-medium">Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan dela Cruz"
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#37476d] text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Min. 8 chars"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#37476d] text-sm font-medium">Confirm</FormLabel>
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
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-11 rounded-full bg-[#245bff] hover:bg-[#1a47cc] font-semibold text-sm shadow-[0_10px_28px_rgba(36,91,255,0.3)]"
            >
              {form.formState.isSubmitting ? "Creating account..." : "Create free account"}
            </Button>
          </form>
        </Form>
      </div>

      <p className="text-center text-sm text-[#6d7b9e] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#245bff] hover:underline font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
