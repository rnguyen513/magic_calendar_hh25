import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/app/(auth)/auth";

import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Navbar = async () => {
  let session = await auth();

  return (
    <nav className="bg-white dark:bg-gray-900 w-full py-3 px-6 flex items-center justify-between shadow-sm border-b border-gray-200 dark:border-gray-800">
      {/* Left Side: Logo & History */}
      <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
          <Image src="/images/gemini-logo.png" height={24} width={24} alt="Gemini logo" />
          <SlashIcon size={18}/>
          <Link href="/in">
            <span className="text-sm font-medium dark:text-gray-300 truncate w-32 md:w-auto">
                mycally
            </span>
          </Link>
        </div>
        <History user={session?.user} />
        <NavLink href="/study-material" label="study material"/>
      </div>

      {/* Right Side: Navigation & User Menu */}
      <div className="flex items-center gap-3">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="px-3 py-1.5 text-sm">
                {session.user?.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ThemeToggle />
              </DropdownMenuItem>
              <DropdownMenuItem className="p-1">
                <form
                  className="w-full"
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button type="submit" className="w-full text-left px-2 py-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-md">
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

// Reusable navigation link component for better consistency
const NavLink = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition">
    {label}
  </Link>
);
