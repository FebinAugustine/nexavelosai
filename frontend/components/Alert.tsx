"use client";

import { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

interface AlertTitleProps {
  children: ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function Alert({
  children,
  variant = "default",
  className = "",
}: AlertProps) {
  const variantClasses = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = "" }: AlertTitleProps) {
  return (
    <h3 className={`font-semibold text-sm mb-1 ${className}`}>{children}</h3>
  );
}

export function AlertDescription({
  children,
  className = "",
}: AlertDescriptionProps) {
  return <div className={`text-sm ${className}`}>{children}</div>;
}
