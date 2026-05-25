"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bike, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await signIn("credentials", {
        email: form.get("email") as string,
        password: form.get("password") as string,
        redirect: false,
      });

      if (res?.error) {
        setError("邮箱或密码错误，请重试");
        return;
      }

      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Card className="relative w-full max-w-sm border-neutral-700/60 bg-neutral-900/80 backdrop-blur-xl animate-fade-in">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-lime-400/10 border border-lime-400/20">
              <Bike className="size-4 text-lime-400" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-neutral-100">VELOX</span>
          </Link>
          <CardTitle className="text-lg">登录账户</CardTitle>
          <CardDescription>欢迎回来，请输入您的凭据</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="velox@example.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-lime-500 hover:bg-lime-400 text-neutral-950 font-semibold gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  登录
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-5">
          <p className="text-xs text-neutral-500">
            还没有账户？{" "}
            <Link href="/register" className="text-lime-400 hover:text-lime-300 transition-colors font-medium">
              立即注册
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
