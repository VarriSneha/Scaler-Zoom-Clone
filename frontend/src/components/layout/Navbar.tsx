import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Video } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-1.5 rounded-xl">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">Zoom</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">Products</Link>
            <Link href="/" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="/" className="hover:text-primary transition-colors">Resources</Link>
            <Link href="/" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-primary">
            <Link href="/meeting/join" className="hover:underline">Join</Link>
            <Link href="/meeting/schedule" className="hover:underline">Host</Link>
          </div>
          <Avatar className="h-9 w-9 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
