import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/15 bg-white/10 backdrop-blur-sm text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 sm:p-6 lg:p-8", className)} {...props} />;
}

// Helper: rating stars (0-5 with halves)
function RatingStars({
  rating,
  size = "lg",
}: {
  rating: number;
  size?: "sm" | "default" | "lg";
}) {
  const starSizes: Record<string, string> = {
    sm: "w-4 h-4",
    default: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const starValue = Math.max(0, Math.min(1, rating - i));
        return (
          <div key={i} className={cn("relative", starSizes[size])}>
            <svg
              className="absolute inset-0 text-gray-300 dark:text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <svg
              className="absolute inset-0 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ clipPath: `inset(0 ${100 - starValue * 100}% 0 0)` }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      })}
      <span className="ml-2 text-sm font-medium text-white">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// Helper: verification check badge
function VerifiedBadge() {
  return (
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
      <svg
        className="w-2 h-2 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

type Testimonial = {
  name: string;
  role: string;
  rating: number;
  testimonial: string;
  avatar: string;
};

function TestimonialCard({ data }: { data: Testimonial }) {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/15">
      <CardContent className="h-full flex flex-col">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-teal-400/30">
              <img
                src={data.avatar}
                alt={data.name}
                className="w-full h-full object-cover"
              />
            </div>
            <VerifiedBadge />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm sm:text-base">
              {data.name}
            </h3>
            <p className="text-teal-400 text-xs sm:text-sm font-medium">
              {data.role}
            </p>
          </div>
        </div>
        <p className="text-white leading-relaxed mb-4 sm:mb-6 flex-1 text-sm sm:text-base mt-2 aspect-video pt-2">
          "{data.testimonial}"
        </p>
        <div className="flex mt-2 sm:mt-4 text-white">
          <RatingStars rating={data.rating} size="lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export { Card, CardContent, TestimonialCard };
