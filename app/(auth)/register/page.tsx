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
import { AlertCircle, ArrowRight } from "lucide-react";

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
      setError(json.error || "Registration failed. Please try again.");
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#b4f03a]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#b4f03a]" />
          Get started
        </span>
        <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight text-white">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-white/50">
          Start tracking your finances with Finlo — free, forever.
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-white/50">Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan dela Cruz"
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/50">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Min. 8 chars"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/50">Confirm</FormLabel>
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
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="mt-2 h-12 w-full rounded-full bg-[#b4f03a] font-bold text-[#0c0c10] shadow-[0_8px_24px_rgba(180,240,58,0.25)] transition-colors hover:bg-[#ccff52] disabled:opacity-60"
            >
              {form.formState.isSubmitting ? (
                "Creating account..."
              ) : (
                <span className="inline-flex items-center gap-2">
                  Create free account <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>
        </Form>
      </div>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#b4f03a] hover:text-[#ccff52]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
