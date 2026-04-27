import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Support both window scroll and scrolling containers
      const scrolled = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      setVisible(scrolled > 250);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollUp}
      aria-label="Retour en haut"
      title="Retour en haut de la page"
      style={{
        position: "fixed",
        bottom: "1.75rem",
        right: "1.75rem",
        zIndex: 9999,
        width: "2.75rem",
        height: "2.75rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "none",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        pointerEvents: visible ? "auto" : "none",
        background: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
      }}
    >
      <ArrowUp style={{ width: "1.2rem", height: "1.2rem" }} />
    </button>
  );
};

export default ScrollToTopButton;
