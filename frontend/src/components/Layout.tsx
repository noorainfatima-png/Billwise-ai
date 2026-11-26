import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ScanLine, Sliders, ReceiptText } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Bill Scanner", icon: ScanLine },
  { to: "/simulator", label: "Simulator", icon: Sliders },
  { to: "/history", label: "Billing Ledger", icon: ReceiptText }
];

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#18181B] flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-[#FFFFFF] border-r border-[#E4E4E7]">
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E4E4E7]">
          <span className="text-base font-semibold tracking-tight text-[#18181B]">
            BillWise AI
          </span>
          <span className="font-mono text-xs px-2 py-0.5 rounded-[6px] bg-[#F8F8F6] border border-[#E4E4E7] text-[#52525B]">
            TGSPDCL
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[6px] text-sm font-medium border ${
                  isActive
                    ? "bg-[#F8F8F6] text-[#18181B] border-[#E4E4E7]"
                    : "text-[#52525B] border-transparent hover:text-[#18181B] hover:bg-[#F8F8F6]"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E4E4E7] text-xs text-[#52525B] space-y-1">
          <div className="font-medium text-[#18181B]">Hyderabad Domestic</div>
          <div className="font-mono tabular-nums">Duty: Rs 0.06/unit</div>
        </div>
      </aside>

      <div className="flex-1 md:pl-60 flex flex-col min-h-screen pb-16 md:pb-0">
        <header className="h-16 bg-[#FFFFFF] border-b border-[#E4E4E7] px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-base font-semibold text-[#18181B]">BillWise AI</span>
          </div>
          <div className="hidden md:block text-sm text-[#52525B]">
            Telangana Domestic Tariff & Usage Monitor
          </div>
          <div className="font-mono text-xs text-[#52525B] tabular-nums">
            SC: TG-HYD-408912
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#FFFFFF] border-t border-[#E4E4E7] grid grid-cols-4 z-20">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-[11px] font-medium ${
                isActive ? "text-[#18181B] bg-[#F8F8F6]" : "text-[#52525B]"
              }`
            }
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
