import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error details are displayed in the fallback UI
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui, Segoe UI, Arial" }}>
          <h2>Admin component crashed</h2>
          <p><b>STAMP:</b> HIBI_FINAL_AUTH_REAL_BOOKINGS_COCKPIT_004_20260209</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 8 }}>
{String(this.state.error)}
          </pre>
          <p>Use the Cockpit tab to keep repairing without a white screen.</p>
        </div>
      );
    }
    return this.props.children;
  }
}