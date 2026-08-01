import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/ui/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Optional inline label — checkboxes conventionally pair a control with
   * adjacent text, unlike the label-above pattern `Label`/`FormField` use
   * for text fields. Omit to render the bare control and compose your own
   * `<label>` (e.g. when the label needs richer markup, like the
   * terms-acceptance link on `/register`). */
  label?: ReactNode;
}

// `/register`'s terms-acceptance control today is an unstyled native
// checkbox — this is its generalized, token-styled replacement, per
// docs/design-system-architecture.md's component table. Themed via the
// native `accent-color` property (Tailwind's `accent-*` utility) rather
// than a hand-drawn custom box + checkmark icon — broadly supported in
// current browsers, keeps full native keyboard/screen-reader behavior for
// free, and needs no icon dependency.
//
// `forwardRef` per docs/design-system-architecture.md's accessibility
// requirements, forwarded to the underlying `<input>` in both the
// bare-control and wrapped-in-label branches.
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...rest },
  ref
) {
  const control = (
    <input
      ref={ref}
      type="checkbox"
      id={id}
      className={cn(
        "size-4 rounded-sm border-border-default text-accent accent-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus",
        "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
        className
      )}
      {...rest}
    />
  );

  if (!label) return control;

  return (
    <label htmlFor={id} className="flex items-start gap-2 text-sm text-foreground">
      {control}
      <span>{label}</span>
    </label>
  );
});
