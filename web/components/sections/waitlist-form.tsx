"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().optional(),
  agreeToPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy to join the waitlist.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [count, setCount] = useState<number>(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      agreeToPrivacy: false,
    },
  });

  // Fetch initial count on mount
  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(() => {});
  }, []);

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          name: values.name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setCount(data.count); // Update counter
      setIsSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset();
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Waitlist submission error:", error);
      form.setError("root", {
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[hsl(var(--brand-primary)/0.1)] border border-[hsl(var(--brand-primary)/0.2)]"
      >
        <div className="w-16 h-16 rounded-full bg-[hsl(var(--brand-primary))] flex items-center justify-center">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-manrope)]">
          You're on the list!
        </h3>
        <p className="text-slate-400 text-center max-w-md">
          We'll notify you when we launch. Get ready to see how AI really thinks.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">
                  Email address *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@company.com"
                    {...field}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[hsl(var(--brand-primary))] focus:ring-[hsl(var(--brand-primary))]"
                  />
                </FormControl>
                <FormMessage className="text-[hsl(var(--brand-accent))]" />
              </FormItem>
            )}
          />

          {/* Name Field (Optional) */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">
                  Name <span className="text-slate-500">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    {...field}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[hsl(var(--brand-primary))] focus:ring-[hsl(var(--brand-primary))]"
                  />
                </FormControl>
                <FormMessage className="text-[hsl(var(--brand-accent))]" />
              </FormItem>
            )}
          />

          {/* Privacy Checkbox */}
          <FormField
            control={form.control}
            name="agreeToPrivacy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-white/20 data-[state=checked]:bg-[hsl(var(--brand-primary))] data-[state=checked]:border-[hsl(var(--brand-primary))]"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-slate-400 font-normal cursor-pointer">
                    I agree to receive updates and understand my data will be
                    processed according to the{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[hsl(var(--brand-primary))] underline hover:text-[hsl(var(--brand-primary)/0.85)] transition-colors"
                    >
                      privacy policy
                    </Link>
                    .
                  </FormLabel>
                  <FormMessage className="text-[hsl(var(--brand-accent))]" />
                </div>
              </FormItem>
            )}
          />

          {/* Root Error */}
          {form.formState.errors.root && (
            <p className="text-sm text-[hsl(var(--brand-accent))]">
              {form.formState.errors.root.message}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.85)] text-white font-semibold py-6 rounded-lg shadow-[0_10px_25px_hsl(var(--brand-primary)/0.4)] hover:shadow-[0_15px_35px_hsl(var(--brand-primary)/0.5)] transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join the Waitlist"
            )}
          </Button>
        </form>
      </Form>

      {/* Trust indicators */}
      {count > 0 && (
        <p className="mt-6 text-xs text-center text-slate-500">
          Join <span className="text-[hsl(var(--brand-primary))] font-semibold">{count.toLocaleString()}+</span> people
          already on the waitlist
        </p>
      )}
    </div>
  );
}

export default WaitlistForm;
