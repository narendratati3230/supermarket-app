import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToastMsg } from '../context/ToastContext';
import './Checkout.css';

const STEPS = ['Cart', 'Delivery', 'Payment', 'Confirm'];

// Dummy test cards
const TEST_CARDS = [
  { number: '4242 4242 4242 4242', brand: 'Visa', result: 'success', label: 'Payment succeeds' },
  { number: '4000 0000 0000 0002', brand: 'Visa', result: 'declined', label: 'Card declined' },
  { number: '4000 0000 0000 9995', brand: 'Visa', result: 'insufficient', label: 'Insufficient funds' },
];

const CARD_BRANDS = {
  '4': 'Visa',
  '5': 'Mastercard',
  '3': 'Amex',
};

function getCardBrand(number) {
  return CARD_BRANDS[number?.[0]] || 'Card';
}

function getCardResult(number) {
  const digits = number.replace(/\s/g, '');
  if (digits === '4000000000000002') return 'declined';
  if (digits === '4000000000009995') return 'insufficient';
  if (digits.length >= 13) return 'success';
  return null;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToastMsg();

  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState({
    address: user?.address || '',
    city: user?.city || '',
    postcode: '',
    phone: user?.phone || '',
    note: '',
  });
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
  const [payErrors, setPayErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(null);
  const [orderId] = useState(`FM${Date.now().toString().slice(-8)}`);
  const [usedTestCard, setUsedTestCard] = useState(null);

  const tax = total * 0.08;
  const grandTotal = total + tax;

  const handleDeliveryChange = (f) => (e) => setDelivery(p => ({ ...p, [f]: e.target.value }));
  const handlePaymentChange = (f) => (e) => {
    let v = e.target.value;
    if (f === 'cardNumber') v = v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    if (f === 'expiry') v = v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5);
    if (f === 'cvv') v = v.replace(/\D/g, '').slice(0, 4);
    setPayment(p => ({ ...p, [f]: v }));
    if (payErrors[f]) setPayErrors(p => ({ ...p, [f]: '' }));
    setPaymentFailed(null);
  };

  const fillTestCard = (card) => {
    setPayment({ cardName: user?.name || 'Test User', cardNumber: card.number, expiry: '12/28', cvv: '123' });
    setUsedTestCard(card);
    setPayErrors({});
    setPaymentFailed(null);
  };

  const validatePayment = () => {
    const e = {};
    if (!payment.cardName.trim()) e.cardName = 'Cardholder name required';
    const digits = payment.cardNumber.replace(/\s/g, '');
    if (!digits || digits.length < 13) e.cardNumber = 'Valid card number required';
    if (!payment.expiry || payment.expiry.length < 5) e.expiry = 'Valid expiry required';
    if (!payment.cvv || payment.cvv.length < 3) e.cvv = 'Valid CVV required';
    return e;
  };

  const PROCESSING_STEPS = [
    'Connecting to payment gateway...',
    'Verifying card details...',
    'Authorising payment...',
    'Confirming order...',
  ];

  const handlePlaceOrder = async () => {
    const errs = validatePayment();
    if (Object.keys(errs).length) { setPayErrors(errs); return; }

    setProcessing(true);
    setProcessingStep(0);

    // Simulate processing steps
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setProcessingStep(i);
      await new Promise(r => setTimeout(r, 800));
    }

    const result = getCardResult(payment.cardNumber);

    if (result === 'declined') {
      setProcessing(false);
      setPaymentFailed('Your card was declined. Please try a different card.');
      addToast('Payment declined', 'error');
      return;
    }

    if (result === 'insufficient') {
      setProcessing(false);
      setPaymentFailed('Insufficient funds. Please try a different card.');
      addToast('Insufficient funds', 'error');
      return;
    }

    // Payment success — save order
    const orders = JSON.parse(localStorage.getItem('freshmart_orders') || '[]');
    const newOrder = {
      id: orderId,
      userId: user?.id,
      items: [...items],
      subtotal: total,
      tax,
      total: grandTotal,
      delivery,
      cardLast4: payment.cardNumber.replace(/\s/g, '').slice(-4),
      cardBrand: getCardBrand(payment.cardNumber),
      status: 'Processing',
      date: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    localStorage.setItem('freshmart_orders', JSON.stringify(orders));

    clearCart();
    setProcessing(false);
    setOrderPlaced(true);
    setStep(3);
    addToast('Order placed successfully! 🎉', 'success');
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <main id="main-content" className="checkout-page">
        <div className="container checkout-empty">
          <span aria-hidden="true">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add some products before checking out.</p>
          <Link to="/shop" className="btn-primary">Browse Shop</Link>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main id="main-content" className="checkout-page">
        <div className="container checkout-empty">
          <span aria-hidden="true">🔒</span>
          <h2>Please sign in to checkout</h2>
          <Link to="/login" state={{ from: '/checkout' }} className="btn-primary">Sign In</Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="checkout-page">
      {/* Processing overlay */}
      {processing && (
        <div className="processing-overlay" role="status" aria-live="polite">
          <div className="processing-card">
            <div className="processing-spinner" aria-hidden="true"/>
            <h3>Processing Payment</h3>
            <p className="processing-msg">{PROCESSING_STEPS[processingStep]}</p>
            <div className="processing-dots" aria-hidden="true">
              {PROCESSING_STEPS.map((_, i) => (
                <span key={i} className={`dot${i <= processingStep ? ' active' : ''}`}/>
              ))}
            </div>
            <p className="processing-secure">🔒 Secured by 256-bit SSL encryption</p>
          </div>
        </div>
      )}

      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <nav aria-label="Checkout steps">
            <ol className="steps-bar">
              {STEPS.map((s, i) => (
                <li key={s} className={`step${i === step ? ' active' : i < step ? ' done' : ''}`} aria-current={i === step ? 'step' : undefined}>
                  <span className="step-num" aria-hidden="true">{i < step ? '✓' : i + 1}</span>
                  <span className="step-label">{s}</span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {/* Step 0: Cart review */}
            {step === 0 && (
              <section className="checkout-section">
                <h2>Review Your Cart</h2>
                <div className="checkout-items">
                  {items.map(item => (
                    <div key={item.id} className="checkout-item">
                      <span className="checkout-item-emoji" aria-hidden="true">{item.emoji}</span>
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">{item.name}</p>
                        <p className="checkout-item-qty">Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                      </div>
                      <span className="checkout-item-price">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-next" onClick={() => setStep(1)}>Continue to Delivery →</button>
              </section>
            )}

            {/* Step 1: Delivery */}
            {step === 1 && (
              <section className="checkout-section">
                <h2>Delivery Details</h2>
                <div className="form-grid">
                  <div className="form-group full">
                    <label htmlFor="address">Street Address *</label>
                    <input id="address" type="text" value={delivery.address} onChange={handleDeliveryChange('address')} placeholder="123 Main Street" autoComplete="street-address" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input id="city" type="text" value={delivery.city} onChange={handleDeliveryChange('city')} placeholder="New York" autoComplete="address-level2" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="postcode">Postcode *</label>
                    <input id="postcode" type="text" value={delivery.postcode} onChange={handleDeliveryChange('postcode')} placeholder="10001" autoComplete="postal-code" />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="del-phone">Phone *</label>
                    <input id="del-phone" type="tel" value={delivery.phone} onChange={handleDeliveryChange('phone')} placeholder="+1 (555) 000-0000" autoComplete="tel" />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="note">Delivery Note <span className="optional">(optional)</span></label>
                    <textarea id="note" value={delivery.note} onChange={handleDeliveryChange('note')} placeholder="Leave at door, ring bell, etc." rows={3}/>
                  </div>
                </div>
                <div className="checkout-btns">
                  <button className="btn-back" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn-next" onClick={() => {
                    if (delivery.address && delivery.city && delivery.postcode) setStep(2);
                    else addToast('Please fill all required fields', 'error');
                  }}>Continue to Payment →</button>
                </div>
              </section>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <section className="checkout-section">
                <h2>Payment Details</h2>

                {/* Test cards panel */}
                <div className="test-cards-panel">
                  <div className="test-cards-header">
                    <span className="test-badge">🧪 Test Mode</span>
                    <p>Use these dummy cards to test the payment flow</p>
                  </div>
                  <div className="test-cards-list">
                    {TEST_CARDS.map(card => (
                      <button
                        key={card.number}
                        className={`test-card-btn${usedTestCard?.number === card.number ? ' selected' : ''}`}
                        onClick={() => fillTestCard(card)}
                        type="button"
                      >
                        <div className="test-card-left">
                          <span className="test-card-brand">{card.brand}</span>
                          <span className="test-card-number">{card.number}</span>
                        </div>
                        <span className={`test-card-result ${card.result}`}>
                          {card.result === 'success' ? '✓' : '✕'} {card.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="test-cards-hint">Click any card above to auto-fill the form ↓</p>
                </div>

                {paymentFailed && (
                  <div className="payment-error-banner" role="alert">
                    <span>✕</span> {paymentFailed}
                  </div>
                )}

                {/* Live card preview */}
                <div className={`card-visual ${getCardBrand(payment.cardNumber).toLowerCase()}`} aria-hidden="true">
                  <div className="card-top">
                    <span className="card-chip-icon">💳</span>
                    <span className="card-brand-label">{getCardBrand(payment.cardNumber)}</span>
                  </div>
                  <p className="card-number-display">
                    {payment.cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div className="card-bottom">
                    <div>
                      <span className="card-field-label">Card Holder</span>
                      <span>{payment.cardName || 'YOUR NAME'}</span>
                    </div>
                    <div>
                      <span className="card-field-label">Expires</span>
                      <span>{payment.expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className={`form-group full${payErrors.cardName ? ' has-error' : ''}`}>
                    <label htmlFor="cardName">Cardholder Name *</label>
                    <input id="cardName" type="text" value={payment.cardName} onChange={handlePaymentChange('cardName')} placeholder="John Smith" autoComplete="cc-name" />
                    {payErrors.cardName && <span className="field-error" role="alert">{payErrors.cardName}</span>}
                  </div>
                  <div className={`form-group full${payErrors.cardNumber ? ' has-error' : ''}`}>
                    <label htmlFor="cardNumber">Card Number *</label>
                    <input id="cardNumber" type="text" inputMode="numeric" value={payment.cardNumber} onChange={handlePaymentChange('cardNumber')} placeholder="1234 5678 9012 3456" autoComplete="cc-number" />
                    {payErrors.cardNumber && <span className="field-error" role="alert">{payErrors.cardNumber}</span>}
                  </div>
                  <div className={`form-group${payErrors.expiry ? ' has-error' : ''}`}>
                    <label htmlFor="expiry">Expiry Date *</label>
                    <input id="expiry" type="text" inputMode="numeric" value={payment.expiry} onChange={handlePaymentChange('expiry')} placeholder="MM/YY" autoComplete="cc-exp" />
                    {payErrors.expiry && <span className="field-error" role="alert">{payErrors.expiry}</span>}
                  </div>
                  <div className={`form-group${payErrors.cvv ? ' has-error' : ''}`}>
                    <label htmlFor="cvv">CVV *</label>
                    <input id="cvv" type="text" inputMode="numeric" value={payment.cvv} onChange={handlePaymentChange('cvv')} placeholder="123" autoComplete="cc-csc" />
                    {payErrors.cvv && <span className="field-error" role="alert">{payErrors.cvv}</span>}
                  </div>
                </div>

                <div className="checkout-btns">
                  <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-place-order" onClick={handlePlaceOrder} disabled={processing}>
                    🔒 Pay ${grandTotal.toFixed(2)}
                  </button>
                </div>
              </section>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && orderPlaced && (
              <section className="checkout-section order-success">
                <div className="success-animation" aria-hidden="true">
                  <div className="success-circle">✓</div>
                </div>
                <h2>Order Confirmed!</h2>
                <p>Thank you, <strong>{user.name}</strong>! Your order has been placed successfully.</p>

                <div className="order-confirmation-details">
                  <div className="order-id-box">
                    <span>Order ID</span>
                    <strong>#{orderId}</strong>
                  </div>
                  <div className="order-confirm-rows">
                    <div className="order-confirm-row">
                      <span>📦 Items</span>
                      <span>{items.length} items (cart cleared)</span>
                    </div>
                    <div className="order-confirm-row">
                      <span>💳 Payment</span>
                      <span>{getCardBrand(payment.cardNumber)} ending in {payment.cardNumber.replace(/\s/g,'').slice(-4)}</span>
                    </div>
                    <div className="order-confirm-row">
                      <span>🚚 Delivery to</span>
                      <span>{delivery.address}, {delivery.city}</span>
                    </div>
                    <div className="order-confirm-row">
                      <span>💰 Total charged</span>
                      <strong>${grandTotal.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div className="order-timeline">
                  <h3>What happens next?</h3>
                  <div className="timeline">
                    {[
                      { icon: '✅', label: 'Order Confirmed', desc: 'Right now', done: true },
                      { icon: '👨‍🍳', label: 'Being Prepared', desc: 'Next 15 mins', done: false },
                      { icon: '🚚', label: 'Out for Delivery', desc: 'Within 1 hour', done: false },
                      { icon: '🏠', label: 'Delivered', desc: 'Est. 60–90 mins', done: false },
                    ].map((t, i) => (
                      <div key={i} className={`timeline-item${t.done ? ' done' : ''}`}>
                        <div className="timeline-icon">{t.icon}</div>
                        <div className="timeline-info">
                          <p className="timeline-label">{t.label}</p>
                          <p className="timeline-desc">{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="success-actions">
                  <Link to="/orders" className="btn-primary">View My Orders</Link>
                  <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
                </div>
              </section>
            )}
          </div>

          {/* Order summary sidebar */}
          {step < 3 && (
            <aside className="order-summary" aria-labelledby="summary-heading">
              <h2 id="summary-heading">Order Summary</h2>
              <div className="summary-items">
                {items.map(item => (
                  <div key={item.id} className="summary-item">
                    <span className="summary-emoji" aria-hidden="true">{item.emoji}</span>
                    <span className="summary-name">{item.name} ×{item.qty}</span>
                    <span className="summary-price">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="summary-row"><span>Delivery</span><span className="free-tag">FREE</span></div>
                <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="summary-row total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}