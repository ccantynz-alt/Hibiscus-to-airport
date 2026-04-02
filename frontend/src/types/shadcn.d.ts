// Type declarations for Shadcn/UI components (JSX files used from TypeScript)
// This allows .tsx files to import .jsx components with proper typing.

declare module "components/ui/card" {
  import type { FC, HTMLAttributes, ReactNode } from "react";
  export const Card: FC<HTMLAttributes<HTMLDivElement> & { children?: ReactNode }>;
  export const CardHeader: FC<HTMLAttributes<HTMLDivElement> & { children?: ReactNode }>;
  export const CardFooter: FC<HTMLAttributes<HTMLDivElement> & { children?: ReactNode }>;
  export const CardTitle: FC<HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }>;
  export const CardDescription: FC<HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }>;
  export const CardContent: FC<HTMLAttributes<HTMLDivElement> & { children?: ReactNode }>;
}

declare module "components/ui/button" {
  import type { FC, ButtonHTMLAttributes, ReactNode } from "react";
  export const Button: FC<
    ButtonHTMLAttributes<HTMLButtonElement> & {
      children?: ReactNode;
      variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
      size?: "default" | "sm" | "lg" | "icon";
      asChild?: boolean;
    }
  >;
  export function buttonVariants(props?: {
    variant?: string;
    size?: string;
  }): string;
}

declare module "components/ui/input" {
  import type { FC, InputHTMLAttributes } from "react";
  export const Input: FC<InputHTMLAttributes<HTMLInputElement>>;
}

declare module "components/ui/textarea" {
  import type { FC, TextareaHTMLAttributes } from "react";
  export const Textarea: FC<TextareaHTMLAttributes<HTMLTextAreaElement>>;
}

declare module "components/ui/label" {
  import type { FC, LabelHTMLAttributes, ReactNode } from "react";
  export const Label: FC<LabelHTMLAttributes<HTMLLabelElement> & { children?: ReactNode }>;
}

declare module "components/ui/separator" {
  import type { FC, HTMLAttributes } from "react";
  export const Separator: FC<HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical"; decorative?: boolean }>;
}

declare module "components/ui/skeleton" {
  import type { FC, HTMLAttributes } from "react";
  export const Skeleton: FC<HTMLAttributes<HTMLDivElement>>;
}

declare module "components/ui/switch" {
  import type { FC } from "react";
  export const Switch: FC<{
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
  }>;
}

declare module "components/ui/popover" {
  import type { FC, ReactNode } from "react";
  export const Popover: FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }>;
  export const PopoverTrigger: FC<{ asChild?: boolean; children?: ReactNode }>;
  export const PopoverContent: FC<{ className?: string; align?: string; children?: ReactNode; side?: string; sideOffset?: number }>;
}

declare module "components/ui/select" {
  import type { FC, ReactNode } from "react";
  export const Select: FC<{ onValueChange?: (value: string) => void; value?: string; defaultValue?: string; children?: ReactNode }>;
  export const SelectGroup: FC<{ children?: ReactNode }>;
  export const SelectValue: FC<{ placeholder?: string }>;
  export const SelectTrigger: FC<{ className?: string; children?: ReactNode }>;
  export const SelectContent: FC<{ className?: string; children?: ReactNode }>;
  export const SelectItem: FC<{ value: string; children?: ReactNode; className?: string }>;
  export const SelectLabel: FC<{ children?: ReactNode }>;
  export const SelectSeparator: FC;
}

declare module "components/ui/alert" {
  import type { FC, HTMLAttributes, ReactNode } from "react";
  export const Alert: FC<HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive"; children?: ReactNode }>;
  export const AlertTitle: FC<HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }>;
  export const AlertDescription: FC<HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }>;
}

declare module "components/ui/calendar" {
  import type { FC } from "react";
  export const Calendar: FC<{
    mode?: "single" | "range" | "multiple";
    selected?: Date | Date[] | undefined;
    onSelect?: (date: Date | undefined) => void;
    disabled?: (date: Date) => boolean;
    initialFocus?: boolean;
    className?: string;
    classNames?: Record<string, string>;
    showOutsideDays?: boolean;
  }>;
}

declare module "components/ui/form" {
  import type { FC, ReactNode, HTMLAttributes } from "react";
  import type { ControllerProps, FieldValues, FieldPath, UseFormReturn } from "react-hook-form";

  export function Form<T extends FieldValues>(props: UseFormReturn<T> & { children?: ReactNode }): JSX.Element;
  export function FormField<T extends FieldValues>(props: ControllerProps<T>): JSX.Element;
  export const FormItem: FC<HTMLAttributes<HTMLDivElement> & { children?: ReactNode }>;
  export const FormLabel: FC<HTMLAttributes<HTMLLabelElement> & { children?: ReactNode }>;
  export const FormControl: FC<{ children?: ReactNode }>;
  export const FormDescription: FC<HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }>;
  export const FormMessage: FC<HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }>;
  export function useFormField(): {
    id: string;
    name: string;
    formItemId: string;
    formDescriptionId: string;
    formMessageId: string;
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    error?: { message?: string };
  };
}

declare module "components/ui/tabs" {
  import type { FC, ReactNode } from "react";
  export const Tabs: FC<{ defaultValue?: string; value?: string; onValueChange?: (value: string) => void; className?: string; children?: ReactNode }>;
  export const TabsList: FC<{ className?: string; children?: ReactNode }>;
  export const TabsTrigger: FC<{ value: string; className?: string; children?: ReactNode }>;
  export const TabsContent: FC<{ value: string; className?: string; children?: ReactNode }>;
}

declare module "components/ui/badge" {
  import type { FC, HTMLAttributes, ReactNode } from "react";
  export const Badge: FC<HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline"; children?: ReactNode }>;
}

declare module "components/ui/table" {
  import type { FC, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from "react";
  export const Table: FC<HTMLAttributes<HTMLTableElement> & { children?: ReactNode }>;
  export const TableHeader: FC<HTMLAttributes<HTMLTableSectionElement> & { children?: ReactNode }>;
  export const TableBody: FC<HTMLAttributes<HTMLTableSectionElement> & { children?: ReactNode }>;
  export const TableFooter: FC<HTMLAttributes<HTMLTableSectionElement> & { children?: ReactNode }>;
  export const TableHead: FC<ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }>;
  export const TableRow: FC<HTMLAttributes<HTMLTableRowElement> & { children?: ReactNode }>;
  export const TableCell: FC<TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }>;
  export const TableCaption: FC<HTMLAttributes<HTMLTableCaptionElement> & { children?: ReactNode }>;
}

declare module "components/ui/dialog" {
  import type { FC, ReactNode } from "react";
  export const Dialog: FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }>;
  export const DialogTrigger: FC<{ asChild?: boolean; children?: ReactNode }>;
  export const DialogContent: FC<{ className?: string; children?: ReactNode }>;
  export const DialogHeader: FC<{ className?: string; children?: ReactNode }>;
  export const DialogFooter: FC<{ className?: string; children?: ReactNode }>;
  export const DialogTitle: FC<{ className?: string; children?: ReactNode }>;
  export const DialogDescription: FC<{ className?: string; children?: ReactNode }>;
}

declare module "components/ui/dropdown-menu" {
  import type { FC, ReactNode } from "react";
  export const DropdownMenu: FC<{ children?: ReactNode }>;
  export const DropdownMenuTrigger: FC<{ asChild?: boolean; children?: ReactNode }>;
  export const DropdownMenuContent: FC<{ align?: string; className?: string; children?: ReactNode }>;
  export const DropdownMenuItem: FC<{ className?: string; onClick?: () => void; children?: ReactNode }>;
  export const DropdownMenuLabel: FC<{ children?: ReactNode }>;
  export const DropdownMenuSeparator: FC;
}

declare module "components/ui/scroll-area" {
  import type { FC, ReactNode } from "react";
  export const ScrollArea: FC<{ className?: string; children?: ReactNode }>;
  export const ScrollBar: FC<{ orientation?: "horizontal" | "vertical" }>;
}

declare module "components/ui/tooltip" {
  import type { FC, ReactNode } from "react";
  export const Tooltip: FC<{ children?: ReactNode }>;
  export const TooltipTrigger: FC<{ asChild?: boolean; children?: ReactNode }>;
  export const TooltipContent: FC<{ className?: string; side?: string; children?: ReactNode }>;
  export const TooltipProvider: FC<{ children?: ReactNode }>;
}

declare module "components/ui/sonner" {
  import type { FC } from "react";
  export const Toaster: FC;
}

// Non-UI module declarations
declare module "components/Header" {
  import type { FC } from "react";
  const Header: FC;
  export default Header;
}

declare module "components/Footer" {
  import type { FC } from "react";
  const Footer: FC;
  export default Footer;
}

declare module "components/ErrorBoundary" {
  import type { FC, ReactNode } from "react";
  const ErrorBoundary: FC<{ children?: ReactNode }>;
  export default ErrorBoundary;
}

declare module "lib/utils" {
  export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string;
}

declare module "config" {
  export const BACKEND_URL: string;
  export const GOOGLE_MAPS_API_KEY: string;
}

declare module "hooks/useGoogleMaps" {
  export function useGoogleMaps(apiKey: string): { isLoaded: boolean; loadError: Error | null };
  export function attachAutocomplete(
    inputRef: React.RefObject<HTMLInputElement>,
    acRef: React.MutableRefObject<unknown>,
    onPlaceChanged: (address: string) => void
  ): unknown;
}
