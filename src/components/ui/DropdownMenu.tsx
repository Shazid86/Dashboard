import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";

/**
 * ============================================================
 * DROPDOWN MENU — shadcn-style, headless, portal-safe
 * ============================================================
 *
 * The panel is portaled into document.body at fixed viewport
 * coordinates captured from the trigger, so it is never clipped
 * by overflow-x-auto tables or framer-motion transformed
 * ancestors. Flips above the trigger when there is no room
 * below. Closes on outside mousedown, Escape, scroll, resize.
 * ============================================================
 */

const CloseMenuContext = createContext<() => void>(() => {});

interface DropdownMenuProps {
  trigger: (props: { open: boolean; onToggle: () => void }) => ReactNode;
  label?: string;
  align?: "start" | "end";
  children: ReactNode;
}

const PANEL_WIDTH = 192; // w-48
const VIEWPORT_PAD = 8;

export function DropdownMenu({ trigger, label, align = "end", children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number; triggerTop: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();

    if (rect) {
      const rawLeft = align === "end" ? rect.right - PANEL_WIDTH : rect.left;
      const left = Math.max(
        VIEWPORT_PAD,
        Math.min(rawLeft, window.innerWidth - PANEL_WIDTH - VIEWPORT_PAD)
      );

      setAnchor({ top: rect.bottom + 6, left, triggerTop: rect.top });
    }

    setOpen(true);
  }, [open, align]);

  /*
   * Flip above the trigger when the panel would overflow the viewport.
   */

  useLayoutEffect(() => {
    if (!open || !anchor || !panelRef.current) return;

    const panelRect = panelRef.current.getBoundingClientRect();

    if (anchor.top + panelRect.height > window.innerHeight - VIEWPORT_PAD) {
      setAnchor((current) =>
        current
          ? { ...current, top: Math.max(VIEWPORT_PAD, current.triggerTop - panelRect.height - 6) }
          : current
      );
    }
  }, [open, anchor]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;

      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const onScrollOrResize = () => close();

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, close]);

  return (
    <div ref={triggerRef} className="inline-flex">
      {trigger({ open, onToggle: toggle })}

      {open &&
        anchor &&
        createPortal(
          <CloseMenuContext.Provider value={close}>
            <div
              ref={panelRef}
              role="menu"
              aria-label={label}
              style={{ position: "fixed", top: anchor.top, left: anchor.left }}
              className="z-[90] w-48 rounded-2xl border border-white/10 bg-ink-900/95 p-1.5 shadow-2xl backdrop-blur-md"
            >
              {label && (
                <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  {label}
                </p>
              )}

              <div className="flex flex-col">{children}</div>
            </div>
          </CloseMenuContext.Provider>,
          document.body
        )}
    </div>
  );
}

interface DropdownMenuItemProps {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
}

export function DropdownMenuItem({ icon: Icon, children, onSelect, danger }: DropdownMenuItemProps) {
  const close = useContext(CloseMenuContext);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        close();
        onSelect?.();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
        danger
          ? "text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          : "text-white/70 hover:bg-white/[0.06] hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </button>
  );
}