import {SVGProps} from "react";
import {cn} from "@/lib/utils.ts";
import {createPortal} from "react-dom";

export interface ISVGProps extends SVGProps<SVGSVGElement> {
    size?: number;
    className?: string;
}

export const LoadingSpinner = ({
                                   size = 24,
                                   className,
                                   ...props
                               }: ISVGProps) => {
    return createPortal(
        <div className="flex bg-gray-900 pl-5 pr-5 pt-2 pb-2 rounded" id="loading-inner">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                {...props}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("animate-spin", className)}
            >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span className="ml-2 loading">Loading<span>.</span><span>.</span><span>.</span></span>

        </div>, document.getElementById('loading')!)

};
