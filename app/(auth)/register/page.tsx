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
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#287f75]">Register</p>
        <h1 className="font-heading text-3xl font-semibold text-[#0f2424] mb-1.5">Create your account</h1>
        <p className="text-[#5d6a89] text-sm">Start tracking your finances with Finlo for free.</p>
      </div>

      <div className="rounded-[1.7rem] border border-[#d8e3df] bg-white/90 shadow-[0_18px_55px_rgba(15,36,36,0.11)] p-8 backdrop-blur-sm">
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
                      className="rounded-xl border-[#d3e0dc] bg-white h-11 text-[#1a3d39] placeholder:text-[#819690] focus:border-[#3d9187] focus:ring-[#3d9187]/20"
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
                      className="rounded-xl border-[#d3e0dc] bg-white h-11 text-[#1a3d39] placeholder:text-[#819690] focus:border-[#3d9187] focus:ring-[#3d9187]/20"
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
                        className="rounded-xl border-[#d3e0dc] bg-white h-11 text-[#1a3d39] placeholder:text-[#819690] focus:border-[#3d9187] focus:ring-[#3d9187]/20"
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
                        className="rounded-xl border-[#d3e0dc] bg-white h-11 text-[#1a3d39] placeholder:text-[#819690] focus:border-[#3d9187] focus:ring-[#3d9187]/20"
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
              className="w-full h-11 rounded-full bg-[#2f7f76] hover:bg-[#266a63] font-semibold text-sm shadow-[0_10px_28px_rgba(47,127,118,0.3)]"
            >
              {form.formState.isSubmitting ? "Creating account..." : "Create free account"}
            </Button>
          </form>
        </Form>
      </div>

      <p className="text-center text-sm text-[#6d7b9e] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2f7f76] hover:underline font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
