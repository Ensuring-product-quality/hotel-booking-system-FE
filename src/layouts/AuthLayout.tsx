import { Outlet } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex flex-1 flex-col">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
