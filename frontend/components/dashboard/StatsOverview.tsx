"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCircleProps {
    label: string;
    value: string; // e.g., "0g / 110g" or "3 sets"
    percentage: number;
    colorClass: string;
}

function StatCircle({ label, value, percentage, colorClass }: StatCircleProps) {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center">
                {/* Background Circle */}
                <svg className="h-20 w-20 transform -rotate-90">
                    <circle
                        className="text-muted"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="40"
                        cy="40"
                    />
                    {/* Progress Circle */}
                    <circle
                        className={cn("transition-all duration-500 ease-in-out", colorClass)}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="40"
                        cy="40"
                    />
                </svg>
                <span className="absolute text-sm font-bold text-foreground">
                    {percentage}%
                </span>
            </div>
            <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{value}</p>
            </div>
        </div>
    );
}

export function StatsOverview() {
    return (
        <Card className="p-6 space-y-4 shadow-sm border-none">
            <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-muted">
                    {/* Icon placeholder - target */}
                    <div className="w-4 h-4 rounded-full bg-foreground/20" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Daily Goals</h3>
            </div>

            <div className="flex justify-between px-2">
                <StatCircle
                    label="Volume"
                    value="0kg / 5000kg"
                    percentage={15}
                    colorClass="text-chart-1"
                />
                <StatCircle
                    label="Sets"
                    value="0 / 20 sets"
                    percentage={0}
                    colorClass="text-chart-2"
                />
                <StatCircle
                    label="Repetitions"
                    value="0 / 200 reps"
                    percentage={0}
                    colorClass="text-chart-3"
                />
            </div>
        </Card>
    );
}
