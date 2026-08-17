import { Link, useLocation } from "react-router";
import { getAllRoutes } from "./router-utils";
import { useState } from "react";

export default function NavigationMenu() {
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
    <nav className="bg-red border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-900">
            React App
          </Link>
          <button
            onClick={toggleMenu}
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="flex h-6 w-6 flex-col justify-center space-y-1.5">
              <span
                className={`block h-0.5 w-6 bg-current transition-all ${isOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span className={`block h-0.5 w-6 bg-current transition-all ${isOpen ? "opacity-0" : ""}`} />
              <span
                className={`block h-0.5 w-6 bg-current transition-all ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
        {isOpen && (
          <div className="pb-4">
            <div className="flex flex-col space-y-2">
              {navigationRoutes.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.path) ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
