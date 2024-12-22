import { PublicRoute } from "@/components/auth/public-route";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicRoute>
      <div className="h-screen flex items-center justify-center">
        {children}
      </div>
    </PublicRoute>
  );
}
