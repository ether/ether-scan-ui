import {ImgHTMLAttributes} from "react";
import {createPortal} from "react-dom";
import {Card} from "@/components/ui/card.tsx";

export interface ISpinnerProps extends ImgHTMLAttributes<HTMLImageElement> {
    size?: number;
    className?: string;
}

export const LoadingSpinner = ({
                                   size = 128,
                                   className,
                                   ...props
                               }: ISpinnerProps) => {
    return createPortal(
        <div className="flex pl-5 pr-5 pt-2 pb-2 rounded" id="loading-inner">
            <Card className="border-border bg-accent">
                <img width={size} height={size} src='/brand.svg' {...props} alt='Loading animation'/>
                <div style={{textAlign: 'center'}}>
                    <span  className="ml-2 loading">Loading<span>.</span><span>.</span><span>.</span></span>
                </div>
            </Card>
        </div>, document.getElementById('loading')!)

};
