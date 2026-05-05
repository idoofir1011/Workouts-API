"use client";

import { Button } from "@/components/ui/button";
import { Plus, NotebookPen, Camera, Upload } from "lucide-react";

export function ActionGrid() {
    const handleAction = (action: string) => {
        alert(`${action} clicked! This feature is coming soon.`);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={() => handleAction("Log Workout")}
                    className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl shadow-sm text-base cursor-pointer"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Log Workout
                </Button>
                <Button
                    onClick={() => handleAction("New Split")}
                    className="h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-2xl shadow-sm text-base cursor-pointer"
                >
                    <NotebookPen className="mr-2 h-5 w-5" />
                    New Split
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleAction("Take Photo")} variant="outline" className="h-12 rounded-xl bg-white border-none shadow-sm hover:bg-muted font-medium text-muted-foreground cursor-pointer">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                </Button>
                <Button onClick={() => handleAction("Upload Photo")} variant="outline" className="h-12 rounded-xl bg-white border-none shadow-sm hover:bg-muted font-medium text-muted-foreground cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                </Button>
            </div>
        </div>
    );
}
