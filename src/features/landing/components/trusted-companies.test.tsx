// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrustedCompanies } from "./trusted-companies";

const autoScrollPlay = vi.fn();
const autoScrollStop = vi.fn();
const emblaApi = {
  canGoToNext: vi.fn(() => true),
  canGoToPrev: vi.fn(() => true),
  goToNext: vi.fn(),
  goToPrev: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  plugins: vi.fn(() => ({
    autoScroll: {
      play: autoScrollPlay,
      stop: autoScrollStop,
    },
    autoplay: {
      play: vi.fn(),
    },
  })),
};

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), emblaApi],
}));

vi.mock("embla-carousel-accessibility", () => ({
  default: vi.fn(() => ({ name: "accessibility" })),
}));
vi.mock("embla-carousel-auto-height", () => ({
  default: vi.fn(() => ({ name: "autoHeight" })),
}));
vi.mock("embla-carousel-auto-scroll", () => ({
  default: vi.fn(() => ({ name: "autoScroll" })),
}));
vi.mock("embla-carousel-autoplay", () => ({
  default: vi.fn(() => ({ name: "autoplay" })),
}));
vi.mock("embla-carousel-class-names", () => ({
  default: vi.fn(() => ({ name: "classNames" })),
}));
vi.mock("embla-carousel-fade", () => ({
  default: vi.fn(() => ({ name: "fade" })),
}));
vi.mock("embla-carousel-ssr", () => ({
  default: vi.fn(() => ({ name: "ssr" })),
}));
vi.mock("embla-carousel-wheel-gestures", () => ({
  WheelGesturesPlugin: vi.fn(() => ({ name: "wheelGestures" })),
}));

vi.mock("#/components/ui/hover-card.tsx", () => {
  const HoverCardContext = React.createContext(false);

  function HoverCard({
    children,
    open = false,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) {
    return (
      <HoverCardContext.Provider value={open}>
        {children}
      </HoverCardContext.Provider>
    );
  }

  function HoverCardTrigger({
    children,
    closeDelay: _closeDelay,
    delay: _delay,
    render: _render,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    closeDelay?: number;
    delay?: number;
    render?: React.ReactElement;
  }) {
    return (
      <button type="button" {...props}>
        {children}
      </button>
    );
  }

  function HoverCardContent({ children }: { children: React.ReactNode }) {
    const open = React.useContext(HoverCardContext);

    if (!open) return null;

    return <div data-testid="company-card">{children}</div>;
  }

  return { HoverCard, HoverCardContent, HoverCardTrigger };
});

describe("TrustedCompanies", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens a company card on touch tap and resumes auto-scroll when tapped again", async () => {
    render(<TrustedCompanies />);

    await waitFor(() => expect(autoScrollPlay).toHaveBeenCalled());
    vi.clearAllMocks();

    const cahpsaLogo = screen.getByRole("button", { name: "Cahpsa" });

    fireEvent.pointerDown(cahpsaLogo, {
      clientX: 24,
      clientY: 24,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerUp(cahpsaLogo, {
      clientX: 24,
      clientY: 24,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(screen.getByTestId("company-card").textContent).toContain("Cahpsa");
    expect(autoScrollStop).toHaveBeenCalled();

    vi.clearAllMocks();
    fireEvent.pointerDown(cahpsaLogo, {
      clientX: 24,
      clientY: 24,
      pointerId: 2,
      pointerType: "touch",
    });
    fireEvent.pointerUp(cahpsaLogo, {
      clientX: 24,
      clientY: 24,
      pointerId: 2,
      pointerType: "touch",
    });

    await waitFor(() =>
      expect(screen.queryByTestId("company-card")).toBeNull(),
    );
    expect(autoScrollPlay).toHaveBeenCalled();
  });

  it("does not open a company card when the touch moves like a drag", async () => {
    render(<TrustedCompanies />);

    const cahpsaLogo = screen.getByRole("button", { name: "Cahpsa" });

    fireEvent.pointerDown(cahpsaLogo, {
      clientX: 24,
      clientY: 24,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerUp(cahpsaLogo, {
      clientX: 60,
      clientY: 24,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(screen.queryByTestId("company-card")).toBeNull();
  });
});
