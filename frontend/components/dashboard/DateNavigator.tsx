"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, addDays, subDays } from "date-fns";
import { useState } from "react";

export function DateNavigator() {
    const [date, setDate] = useState(new Date());

    const handlePrev = () => setDate((prev) => subDays(prev, 1));
    const handleNext = () => setDate((prev) => addDays(prev, 1));

    return (
        <Card className="flex items-center justify-between p-4 shadow-sm border-none bg-white/80 backdrop-blur-sm">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={handlePrev}
            >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>

            <div className="text-center">
                <h2 className="text-sm font-bold text-foreground">
                    {format(date, "eeee")}
                </h2>
                <p className="text-xs text-muted-foreground">
                    {format(date, "MMMM d, yyyy")}
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={handleNext}
            >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
        </Card>
    );
}
