// components/ui/badge.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        warning:
          "border-transparent bg-[#F39C12] text-white hover:bg-[#F39C12]/80", // Amarillo Construcción
        info: "border-transparent bg-[#2C3E50] text-white hover:bg-[#2C3E50]/80", // Azul Gris Oscuro
        error:
          "border-transparent bg-[#C0392B] text-white hover:bg-[#C0392B]/80", // Rojo Ladrillo
        success:
          "border-transparent bg-[#68A53B] text-white hover:bg-[#68A53B]/80", // Verde Corporativo
        terracota:
          "border-transparent bg-[#E67E22] text-white hover:bg-[#E67E22]/80", // Naranja Terracota
        light:
          "border-transparent bg-[#E7F2E0] text-[#4F7D2C] hover:bg-[#E7F2E0]/80", // Verde Claro con texto verde oscuro
        gray: "border-transparent bg-[#F8F9FA] text-[#6C757D] hover:bg-[#F8F9FA]/80", // Gris Muy Claro con texto gris medio
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
