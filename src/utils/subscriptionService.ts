// Subscription Service for handling all subscription-related operations
const API_BASE_URL = "https://caseprepcrud.onrender.com";

export interface SubscriptionStatus {
  id: string;
  plan: string;
  status: string;
  created_at: string;
  stripe_subscription_id: string;
  current_period_end?: string;
  cancel_at?: string;
}

export interface CancelSubscriptionResponse {
  message: string;
  subscription_id: string;
  cancel_at: number;
  note: string;
}

export interface PortalResponse {
  portal_url: string;
}

export interface CheckoutResponse {
  checkout_url: string;
}

export class SubscriptionService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Authentication required");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Get user's subscription status
   */
  static async getUserSubscription(): Promise<SubscriptionStatus | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const userData = await response.json();
      return userData.subscription || null;
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(plan: string): Promise<CheckoutResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/billing/checkout`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          plan: plan,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create checkout session");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  }

  /**
   * Get Stripe customer portal URL
   */
  static async getCustomerPortalUrl(returnUrl?: string): Promise<PortalResponse> {
    try {
      const url = returnUrl 
        ? `${API_BASE_URL}/api/v1/billing/portal?return_url=${encodeURIComponent(returnUrl)}`
        : `${API_BASE_URL}/api/v1/billing/portal`;

      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to access billing portal");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting customer portal URL:", error);
      throw error;
    }
  }

  /**
   * Cancel subscription directly
   */
  static async cancelSubscription(): Promise<CancelSubscriptionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/billing/cancel-subscription`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to cancel subscription");
      }

      return await response.json();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  static isSubscriptionActive(status: string): boolean {
    return status === "active" || status === "trialing";
  }

  /**
   * Get subscription status display text
   */
  static getStatusDisplayText(status: string): string {
    switch (status) {
      case "active":
        return "Active";
      case "trialing":
        return "Trial";
      case "past_due":
        return "Past Due";
      case "canceled":
        return "Canceled";
      case "unpaid":
        return "Unpaid";
      default:
        return "None";
    }
  }

  /**
   * Get subscription status CSS class
   */
  static getStatusClass(status: string): string {
    switch (status) {
      case "active":
      case "trialing":
        return "active";
      case "past_due":
      case "unpaid":
        return "warning";
      case "canceled":
        return "canceled";
      default:
        return "";
    }
  }

  /**
   * Format subscription period end date
   */
  static formatPeriodEnd(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  /**
   * Check if subscription is in trial period
   */
  static isTrialSubscription(status: string): boolean {
    return status === "trialing";
  }

  /**
   * Check if subscription is canceled
   */
  static isSubscriptionCanceled(status: string): boolean {
    return status === "canceled";
  }

  /**
   * Check if subscription has payment issues
   */
  static hasPaymentIssues(status: string): boolean {
    return status === "past_due" || status === "unpaid";
  }
}

export default SubscriptionService; 