import React from "react";

/**
 * Public site Error Boundary.
 * Catches React component errors and shows a friendly fallback
 * instead of a white screen. Rule 13: Every page must have this.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log to error tracking (PostHog or similar)
    if (typeof window !== "undefined" && window.posthog) {
      window.posthog.capture("error_boundary_triggered", {
        error: String(error),
        componentStack: info?.componentStack,
        page: window.location.pathname,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Segoe UI', system-ui, Arial, sans-serif",
          padding: "40px 20px",
          textAlign: "center",
        }}>
          <h2 style={{ color: "#1f2937", fontSize: "24px", marginBottom: "12px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#6b7280", fontSize: "16px", maxWidth: "400px", marginBottom: "24px" }}>
            We're sorry for the inconvenience. Please try refreshing the page.
            If the problem persists, contact us at 021 743 321.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "white",
              border: "none",
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
