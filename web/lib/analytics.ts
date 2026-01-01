// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

/**
 * Analytics helper object with common event tracking methods
 */
export const analytics = {
  /**
   * Track waitlist join conversion
   */
  joinWaitlist(email: string) {
    trackEvent("join_waitlist", {
      event_category: "conversion",
      event_label: "Waitlist Signup",
      value: 1,
    });
  },

  /**
   * Track tool page view
   */
  viewTool(toolId: string, toolName: string) {
    trackEvent("view_tool", {
      event_category: "engagement",
      event_label: toolName,
      tool_id: toolId,
    });
  },

  /**
   * Track tool demo interaction
   */
  interactWithDemo(toolId: string, toolName: string) {
    trackEvent("interact_demo", {
      event_category: "engagement",
      event_label: toolName,
      tool_id: toolId,
    });
  },

  /**
   * Track install command copy
   */
  copyInstallCommand() {
    trackEvent("copy_install_command", {
      event_category: "engagement",
      event_label: "Install Command",
    });
  },

  /**
   * Track outbound link clicks
   */
  clickOutboundLink(url: string, label: string) {
    trackEvent("click", {
      event_category: "outbound_link",
      event_label: label,
      value: url,
    });
  },
};
