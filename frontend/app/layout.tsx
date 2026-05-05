import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const mPlusRounded1c = M_PLUS_Rounded_1c({
    weight: ["400", "500", "700", "800"],
    subsets: ["latin"],
    variable: "--font-mplus",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Ido's Workout Tracker",
    description: "Track your workouts with style",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${mPlusRounded1c.variable} font-sans antialiased bg-background text-foreground`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
