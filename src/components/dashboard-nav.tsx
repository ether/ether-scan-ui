"use client";


import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import {Link, useLocation} from "react-router";

export interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
    label?: string;
    description?: string;
}


interface DashboardNavProps {
    items: NavItem[];
    setOpen?: Dispatch<SetStateAction<boolean>>;
}

export function DashboardNav({ items, setOpen }: DashboardNavProps) {
    const path = useLocation()
    if (!items?.length) {
        return null;
    }

    return (
        <nav className="grid items-start gap-2">
            {items.map((item, index) => {
                const Icon = Icons[item.icon || "arrowRight"];
                return (
                    item.href && (
                        <Link
                            key={index}
                            to={item.disabled ? "/" : item.href}
                            onClick={() => {
                                if (setOpen) setOpen(false);
                            }}
                        >
              <span
                  className={cn(
                      "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      path.pathname === item.href ? "bg-accent" : "transparent",
                      item.disabled && "cursor-not-allowed opacity-80",
                  )}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </span>
                        </Link>
                    )
                );
            })}
        </nav>
    );
}
