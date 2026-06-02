export interface RevenueCatWebhookEvent {
  api_version: string;
  event: {
    type: RevenueCatEventType;
    app_user_id: string;
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[];
    period_type: 'TRIAL' | 'INTRO' | 'NORMAL';
    purchased_at_ms: number;
    expiration_at_ms: number;
    store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE';
    environment: 'SANDBOX' | 'PRODUCTION';
    is_trial_conversion?: boolean;
    cancel_reason?: string;
    original_transaction_id?: string;
    transaction_id?: string;
    price?: number;
    currency?: string;
    price_in_purchased_currency?: number;
  };
}

export type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'PRODUCT_CHANGE'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'BILLING_ISSUE'
  | 'SUBSCRIBER_ALIAS'
  | 'SUBSCRIPTION_PAUSED'
  | 'TRANSFER'
  | 'EXPIRATION';
