"use client";

import { Header } from "@/components/dashboard/Header";
import { DateNavigator } from "@/components/dashboard/DateNavigator";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { ActionGrid } from "@/components/dashboard/ActionGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12 font-sans pb-24">
            <div className="max-w-md mx-auto space-y-6">
                <Header />
                <DateNavigator />
                <StatsOverview />
                <ProgressBar />
                <ActionGrid />
                <EmptyState />
            </div>
        </div>
    );
}
