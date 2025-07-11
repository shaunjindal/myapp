# Razorpay Integration Guide

## Overview

This app includes a comprehensive Razorpay payment integration that supports both test and live modes. The integration includes:

- ✅ Complete payment flow (order creation, payment processing, verification)
- ✅ Cross-platform support (React Native mobile + web)
- ✅ Webhook handling for payment status updates
- ✅ Refund processing
- ✅ Auto-capture configuration
- ✅ Order status synchronization
- ✅ Test mode indicators

## Key Configuration

### 1. Backend Configuration (Required)

**File:** `app/backend/src/main/resources/application.yml`

Replace the dummy values with your real Razorpay credentials:

```yaml
# Razorpay Configuration
razorpay:
  key-id: ${RAZORPAY_KEY_ID:rzp_test_dummy_key_id}           # ← Replace this
  key-secret: ${RAZORPAY_KEY_SECRET:dummy_key_secret}         # ← Replace this
  webhook-secret: ${RAZORPAY_WEBHOOK_SECRET:dummy_webhook_secret} # ← Replace this
  currency: INR
  auto-capture: ${RAZORPAY_AUTO_CAPTURE:true}
  capture-timeout-minutes: ${RAZORPAY_CAPTURE_TIMEOUT_MINUTES:5}
```

### 2. Environment Variables (Recommended)

For security, set these environment variables instead of hardcoding:

```bash
# Test Mode Keys
export RAZORPAY_KEY_ID="rzp_test_your_actual_test_key_id"
export RAZORPAY_KEY_SECRET="your_actual_test_key_secret"
export RAZORPAY_WEBHOOK_SECRET="your_actual_webhook_secret"

# Live Mode Keys (for production)
export RAZORPAY_KEY_ID="rzp_live_your_actual_live_key_id"
export RAZORPAY_KEY_SECRET="your_actual_live_key_secret"
export RAZORPAY_WEBHOOK_SECRET="your_actual_live_webhook_secret"
```

### 3. Getting Your Razorpay Keys

1. **Login to Razorpay Dashboard:** https://dashboard.razorpay.com/
2. **Navigate to:** Settings → API Keys
3. **For Test Mode:**
   - Click "Generate Test Key"
   - Copy both Key ID and Key Secret
4. **For Live Mode:**
   - Complete KYC verification
   - Click "Generate Live Key"
   - Copy both Key ID and Key Secret

### 4. Webhook Configuration

1. **In Razorpay Dashboard:** Settings → Webhooks
2. **Add Webhook URL:** `https://your-domain.com/api/payment/webhook`
3. **Select Events:**
   - payment.captured
   - payment.failed
   - payment.authorized
4. **Copy Webhook Secret** and add to your configuration

## Frontend Configuration

The frontend automatically detects test/live mode based on the backend response. No additional configuration needed.

## Test Mode vs Live Mode

### Test Mode Indicators
- Key ID starts with `rzp_test_`
- Orange warning banner shown in payment screens
- Console logs indicate test mode
- No real money charged

### Live Mode
- Key ID starts with `rzp_live_`
- No test mode banners
- Real money transactions
- Requires completed KYC

## API Endpoints

### Payment Endpoints
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/create-payment-order` - Create payment order (payment-first flow)
- `POST /api/payment/verify` - Verify payment signature
- `POST /api/payment/refund` - Process refunds
- `POST /api/payment/webhook` - Handle webhooks
- `GET /api/payment/health` - Health check

## Testing

### Test Cards (Test Mode Only)
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (MM/YY)
CVV: Any 3 digits
```

### Test UPI (Test Mode Only)
```
UPI ID: success@razorpay
```

## Payment Flow

### 1. Standard Flow (Order First)
1. Create order in your system
2. Create Razorpay payment order
3. Open Razorpay checkout
4. Process payment
5. Verify payment signature
6. Update order status

### 2. Payment-First Flow
1. Create Razorpay payment order
2. Open Razorpay checkout
3. Process payment
4. Create order in your system
5. Link payment to order

## Security Features

- ✅ HMAC-SHA256 signature verification
- ✅ Webhook signature validation
- ✅ Payment amount validation
- ✅ Order ID validation
- ✅ Secure key storage via environment variables

## Auto-Capture Settings

Configure in `application.yml`:
```yaml
razorpay:
  auto-capture: true  # Automatically capture payments
  capture-timeout-minutes: 5  # Timeout for manual capture
```

## Webhook Events Handled

- **payment.captured** → Updates payment and order status to confirmed
- **payment.failed** → Updates payment status to failed, order to payment_failed
- **payment.authorized** → Updates payment status to authorized

## Error Handling

The integration includes comprehensive error handling for:
- Network failures
- Invalid signatures
- Payment failures
- Webhook validation errors
- Refund failures

## Deployment Checklist

### Test Environment
- [ ] Set test Razorpay keys
- [ ] Configure webhook URL (test)
- [ ] Test payment flow
- [ ] Test webhook delivery

### Production Environment
- [ ] Complete KYC verification
- [ ] Set live Razorpay keys
- [ ] Configure webhook URL (production)
- [ ] Test live payment flow
- [ ] Monitor webhook delivery
- [ ] Set up payment monitoring

## Troubleshooting

### Common Issues

1. **"Invalid Key ID"**
   - Check if key ID is correct
   - Ensure no extra spaces
   - Verify test vs live mode

2. **"Signature Verification Failed"**
   - Check key secret is correct
   - Ensure webhook secret matches
   - Verify payload is not modified

3. **"Payment Not Found"**
   - Check payment ID format
   - Verify database connection
   - Check if payment was created

4. **Webhook Not Received**
   - Verify webhook URL is accessible
   - Check webhook secret
   - Review Razorpay webhook logs

### Debug Mode

Enable debug logging in `application.yml`:
```yaml
logging:
  level:
    com.ecommerce: DEBUG
```

## Support

- **Razorpay Documentation:** https://razorpay.com/docs/
- **Razorpay Support:** https://razorpay.com/support/
- **Integration Status:** All major components implemented ✅

## Implementation Status

- ✅ Payment Gateway Integration
- ✅ Webhook Handler
- ✅ Refund Processing
- ✅ Auto-Capture Configuration
- ✅ Order Status Updates
- ✅ Test Mode Indicators
- ✅ Cross-Platform Support
- ✅ Security Features

Your Razorpay integration is **production-ready**! 🎉 