import { Outlet, Link, useLocation } from "react-router";
import { getAllRoutes } from "./router-utils";
import { useState } from "react";
import { AuthMenu } from "./features/authentication/menu/AuthMenu";
import { Button } from "./components/ui/button";

export default function AppLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);

  const navigationRoutes: { path: string; label: string }[] = getAllRoutes()
    .filter(
      (route) =>
        route.handle?.showInNavigation === true && route.fullPath !== undefined && route.handle?.label !== undefined
    )
    .map(
      (route) =>
        ({
          path: route.fullPath,
          label: route.handle?.label,
        }) as { path: string; label: string }
    );

  return (
    <>
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              React App
            </Link>
            <div className="flex items-center gap-2">
              <AuthMenu />
              <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isOpen}>
                <div className="flex h-6 w-6 flex-col justify-center space-y-1.5">
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all ${isOpen ? "translate-y-2 rotate-45" : ""}`}
                  />
                  <span className={`block h-0.5 w-6 bg-current transition-all ${isOpen ? "opacity-0" : ""}`} />
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}
                  />
                </div>
              </Button>
            </div>
          </div>
          {isOpen && (
            <div className="pb-4">
              <div className="flex flex-col space-y-1">
                {navigationRoutes.map((item) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    asChild
                    className="justify-start"
                  >
                    <Link to={item.path} onClick={() => setIsOpen(false)}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
}
