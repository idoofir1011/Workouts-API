// import { Component } from "lucide-react"; 
// actually I'll just remove the line or replace it with empty string if it's the only import.
// content was: import { Component } from "lucide-react";


export function EmptyState() {
    return (
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">🏋️‍♂️</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No workouts logged for today</h3>
            <p className="text-sm text-muted-foreground">Start tracking your intake above and reach your goals! ✨</p>
        </div>
    );
}
