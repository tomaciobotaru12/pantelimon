import { Suspense } from "react";
import { LoginCard } from "@/components/login-card";

export default function LoginPage() {
  return (
    <div className="container py-16 sm:py-24 flex justify-center">
      <Suspense>
        <LoginCard />
      </Suspense>
    </div>
  );
}
