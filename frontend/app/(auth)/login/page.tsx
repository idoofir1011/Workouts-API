"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const formSchema = z.object({
    username: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
});

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setError(null);
            // FastAPI OAuth2PasswordRequestForm expects form data
            const formData = new FormData();
            formData.append("username", values.username);
            formData.append("password", values.password);

            const data = await login(formData);

            // Store token
            localStorage.setItem("token", data.access_token);

            // Redirect to dashboard
            router.push("/");
        } catch (err: any) {
            console.error(err);
            setError("Invalid email or password");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md p-8 shadow-lg border-none">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Log in to Ido&apos;s Workout Tracker</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="hello@example.com" {...field} className="h-12 rounded-xl bg-muted/50 border-none" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl bg-muted/50 border-none" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                            Log In
                        </Button>
                    </form>
                </Form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Don&apos;t have an account? </span>
                    <Link href="/register" className="font-bold text-primary hover:underline">
                        Sign Up
                    </Link>
                </div>
            </Card>
        </div>
    );
}
