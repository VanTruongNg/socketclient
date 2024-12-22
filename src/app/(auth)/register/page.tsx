"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/use-auth";
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
import type { RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const register = useRegister();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    register.mutate(data);
  });

  return (
    <div className="w-full max-w-sm space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
        <p className="text-sm text-muted-foreground">Tạo tài khoản mới</p>
      </div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên người dùng</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
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
          <Button
            type="submit"
            className="w-full"
            disabled={register.isPending}
          >
            {register.isPending ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
