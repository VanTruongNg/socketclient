"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/use-auth";
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
import Link from "next/link";
import type { LoginInput } from "@/lib/validations/auth";

export default function LoginPage() {
  const login = useLogin();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    login.mutate(data);
  });

  return (
    <div className="w-full max-w-sm space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">Đăng nhập để tiếp tục</p>
      </div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
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
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Đăng ký
        </Link>
      </div>
    </div>
  );
}
