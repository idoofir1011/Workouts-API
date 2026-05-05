"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProgressBar() {
    const current = 0;
    const goal = 2000;

    return (
        <Card className="p-6 space-y-4 shadow-sm border-none">
            <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-sm font-bold text-foreground">Weekly Volume Goal</h3>
                <span className="text-xs font-semibold text-muted-foreground">{current} / {goal} kg</span>
            </div>

            <Progress value={(current / goal) * 100} className="h-3 bg-muted rounded-full indicator-primary" />

            <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 rounded-full bg-chart-4 flex items-center justify-center text-[10px] text-white font-bold">🎯</div>
                <p className="text-xs text-muted-foreground">{goal - current} kg left to reach your goal!</p>
            </div>
        </Card>
    );
}
