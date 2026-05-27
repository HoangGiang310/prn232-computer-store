import { useEffect } from "react";
import { useRouter } from "next/router";
import { logout } from "../lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    logout();
    router.replace("/");
  }, [router]);

  return (
    <main className="main">
      <section className="card header">
        <h1>Đăng xuất</h1>
        <p>Bạn đang được đăng xuất và sẽ được chuyển về trang chủ.</p>
      </section>
    </main>
  );
}
