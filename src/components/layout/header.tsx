import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { cn } from "@/lib/utils";
import {Link} from "react-router-dom";
import Logo from '../../assets/etherpad.svg?react'
export default function Header() {
    return (
        <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
            <nav className="h-14 flex items-center justify-between px-4">
                <div className="hidden md:block">
                    <Link
                        to={"https://etherpad.org/"}
                        target="_blank"
                    >
                        <Logo className="w-36"/>
                    </Link>
                </div>
                <div className={cn("block sm:!hidden")}>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </nav>
        </div>
    );
}
