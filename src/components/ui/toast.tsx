import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          background: "var(--color-card)",
          color: "var(--color-card-foreground)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 10px 40px -8px rgba(0,0,0,0.2)",
          backdropFilter: "blur(12px)",
        },
        success: {
          iconTheme: { primary: "var(--color-success)", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "var(--color-destructive)", secondary: "#fff" },
        },
      }}
    />
  );
}
