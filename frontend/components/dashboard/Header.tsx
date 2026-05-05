import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export function Header() {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-foreground leading-tight">Ido&apos;s Workout Tracker</h1>
                    <p className="text-xs text-muted-foreground">Let&apos;s crush it today!</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm hover:bg-muted text-muted-foreground">
                <Settings className="h-5 w-5" />
            </Button>
        </div>
    );
}
