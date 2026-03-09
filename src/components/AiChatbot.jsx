import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import './AiChatbot.css';

// ── Config ──────────────────────────────────────────────────────────────────
// URL built via function so key is always current (not frozen at parse-time)
const getGeminiUrl = () => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY || ''}`;
const MIN_SEND_GAP   = 6000;   // enforce 6 s client-side gap (10 req/min safe zone)
const MAX_TURNS      = 4;      // only keep last 4 turns — drastically cuts token usage
const RETRY_DELAYS   = [8000, 15000]; // auto-retry after 8s then 15s on 429

// ── Tiny system prompt — NO product list, keeps token count very low ─────────
const SYSTEM_PROMPT = `You are FreshBot, a helpful assistant for FreshMart supermarket.
Keep all replies under 2 sentences. Be friendly and concise.
Policies: free delivery, 1-2 hour arrival, full refunds, Visa/Mastercard/Amex accepted.
If asked about specific products or prices, say you can show them the catalogue.`;

// ── Category → products lookup (used for local product responses) ─────────────
const BY_CATEGORY = products.reduce((acc, p) => {
  if (!acc[p.category]) acc[p.category] = [];
  acc[p.category].push(p);
  return acc;
}, {});

// ── Intent detection — handle locally without calling Gemini ─────────────────
const CART_PATTERNS     = [/my cart/i, /what.*(in|inside).*cart/i, /cart item/i, /show.*cart/i, /view.*cart/i, /cart total/i];
const ORDER_PATTERNS    = [/my order/i, /order status/i, /recent order/i, /show.*order/i, /view.*order/i, /what did i order/i, /track.*order/i, /order history/i];
const CANCEL_PATTERNS   = [/cancel.*order/i, /cancel.*#?([A-Z0-9]+)/i, /i want to cancel/i, /how to cancel/i];
const DELIVERY_PATTERNS = [/deliver/i, /shipping/i, /how long/i, /how fast/i, /when.*arrive/i, /free delivery/i];
const PAYMENT_PATTERNS  = [/payment/i, /pay.*method/i, /accept.*card/i, /visa/i, /mastercard/i, /amex/i, /how.*pay/i, /checkout/i];
const RETURN_PATTERNS   = [/return/i, /refund/i, /exchange/i, /money back/i];
const HOURS_PATTERNS    = [/open/i, /hours/i, /when.*open/i, /business hour/i];
const HELP_PATTERNS     = [/^help$/i, /what can you do/i, /how.*use/i, /what.*help/i];
// Product patterns — all handled locally, never sent to Gemini
const PRODUCE_PATTERNS  = [/fresh produce/i, /fruit/i, /vegetable/i, /veg/i, /produce/i, /strawberr/i, /avocado/i, /spinach/i, /banana/i, /tomato/i];
const DAIRY_PATTERNS    = [/dairy/i, /milk/i, /egg/i, /cheese/i, /yogurt/i, /yoghurt/i];
const MEAT_PATTERNS     = [/meat/i, /chicken/i, /beef/i, /salmon/i, /fish/i, /seafood/i, /protein/i];
const BAKERY_PATTERNS   = [/baker/i, /bread/i, /croissant/i, /bagel/i, /pastry/i, /loaf/i];
const SNACK_PATTERNS    = [/snack/i, /chocolate/i, /nut/i, /crisp/i, /chip/i, /treat/i];
const DRINK_PATTERNS    = [/drink/i, /beverage/i, /juice/i, /water/i, /tea/i, /coffee/i, /soda/i];
const FROZEN_PATTERNS   = [/frozen/i, /pizza/i, /ice cream/i, /freezer/i];
const PANTRY_PATTERNS   = [/pantry/i, /pasta/i, /olive oil/i, /sauce/i, /tin/i, /canned/i];
const BESTSELLER_PATTERNS=[/best seller/i, /popular/i, /top product/i, /most bought/i, /recommend/i, /what.*good/i, /what.*have/i, /what.*sell/i, /what.*offer/i, /show.*product/i, /see.*product/i, /all product/i, /available/i, /in stock/i, /catalogue/i, /catalog/i];
const CHEAP_PATTERNS    = [/cheap/i, /budget/i, /afford/i, /low.*(price|cost)/i, /under \\$[0-9]/i, /less than/i, /deal/i, /discount/i, /sale/i];
const PRICE_PATTERNS    = [/how much/i, /price of/i, /cost of/i, /what.*price/i, /price.*list/i];

function detectIntent(text) {
  if (CANCEL_PATTERNS.some(p => p.test(text)))    return 'cancel';
  if (CART_PATTERNS.some(p => p.test(text)))       return 'cart';
  if (ORDER_PATTERNS.some(p => p.test(text)))      return 'orders';
  if (DELIVERY_PATTERNS.some(p => p.test(text)))   return 'delivery';
  if (PAYMENT_PATTERNS.some(p => p.test(text)))    return 'payment';
  if (RETURN_PATTERNS.some(p => p.test(text)))     return 'returns';
  if (HOURS_PATTERNS.some(p => p.test(text)))      return 'hours';
  if (HELP_PATTERNS.some(p => p.test(text)))       return 'help';
  if (PRODUCE_PATTERNS.some(p => p.test(text)))    return 'produce';
  if (DAIRY_PATTERNS.some(p => p.test(text)))      return 'dairy';
  if (MEAT_PATTERNS.some(p => p.test(text)))       return 'meat';
  if (BAKERY_PATTERNS.some(p => p.test(text)))     return 'bakery';
  if (SNACK_PATTERNS.some(p => p.test(text)))      return 'snacks';
  if (DRINK_PATTERNS.some(p => p.test(text)))      return 'beverages';
  if (FROZEN_PATTERNS.some(p => p.test(text)))     return 'frozen';
  if (PANTRY_PATTERNS.some(p => p.test(text)))     return 'pantry';
  if (BESTSELLER_PATTERNS.some(p => p.test(text))) return 'bestsellers';
  if (CHEAP_PATTERNS.some(p => p.test(text)))      return 'budget';
  if (PRICE_PATTERNS.some(p => p.test(text)))      return 'prices';
  return 'ai'; // Gemini only for truly open-ended questions
}

// ── Safe data helpers ────────────────────────────────────────────────────────
function getUserOrders(user, limit = 5) {
  if (!user) return [];
  const all = JSON.parse(localStorage.getItem('freshmart_orders') || '[]');
  return all
    .filter(o => o.userId === user.id)  // ← only this user, never others
    .slice(0, limit)
    .map(o => ({
      id:        o.id,
      status:    o.status,
      date:      o.date,
      total:     o.total,
      items:     (o.items || []).map(i => `${i.name} ×${i.qty}`),
      itemCount: (o.items || []).length,
    }));
}

// ── Local response generators (no API call needed) ───────────────────────────
function localCartResponse(user, cartItems, cartTotal) {
  if (!user) return {
    text: 'You need to be signed in to view your cart. 🔐',
    actions: [{ type: 'needs_login' }],
    followUps: ['What fresh produce do you have?', 'How does delivery work?'],
  };
  if (!cartItems.length) return {
    text: "Your cart is empty right now. Let me help you find something! 🛒",
    actions: [{ type: 'go_shop' }],
    followUps: ['What fresh fruits and vegetables do you have?', 'What are your best sellers?', 'Show me frozen foods'],
  };

  const lines = cartItems.map(i =>
    `• ${i.emoji || ''} **${i.name}** ×${i.qty} — $${(i.price * i.qty).toFixed(2)}`
  ).join('\n');

  return {
    text: `Here's your cart (${cartItems.length} item${cartItems.length > 1 ? 's' : ''}):\n\n${lines}\n\n**Total: $${cartTotal.toFixed(2)}**`,
    actions: [
      { type: 'go_checkout' },
      { type: 'go_shop' },
    ],
    followUps: ['Show my recent orders', 'How does delivery work?', 'What payment methods do you accept?'],
  };
}

function localOrdersResponse(user) {
  if (!user) return {
    text: 'Please sign in to view your orders. 🔐',
    actions: [{ type: 'needs_login' }],
    followUps: ['What fresh produce do you have?', 'How does delivery work?'],
  };

  const orders = getUserOrders(user);
  if (!orders.length) return {
    text: "You haven't placed any orders yet. Ready to start shopping? 🛍️",
    actions: [{ type: 'go_shop' }],
    followUps: ['What are your best sellers?', 'What fresh produce do you have?', 'How does delivery work?'],
  };

  const statusIcon = { Processing:'⏳', Confirmed:'✅', Shipped:'🚚', Delivered:'📦', Cancelled:'✕' };
  const lines = orders.map(o =>
    `${statusIcon[o.status] || '•'} **#${o.id}** — ${o.status} — $${o.total?.toFixed(2) || '?'} — ${new Date(o.date).toLocaleDateString()}`
  ).join('\n');

  const hasCancellable = orders.some(o => ['Processing','Confirmed'].includes(o.status));

  return {
    text: `Your recent orders:\n\n${lines}`,
    actions: [
      { type: 'go_orders' },
      ...(hasCancellable ? [{ type: 'suggest_cancel' }] : []),
    ],
    followUps: ['What is in my cart?', 'Continue shopping', 'What payment methods do you accept?'],
  };
}

function localCancelResponse(user, text) {
  if (!user) return {
    text: 'Please sign in to manage your orders. 🔐',
    actions: [{ type: 'needs_login' }],
    followUps: ['How does delivery work?', 'What fresh produce do you have?'],
  };

  const match = text.match(/\b(FM[A-Z0-9]{6,})\b/i) || text.match(/#([A-Z0-9]{6,})/i);

  if (!match) {
    const cancellable = getUserOrders(user, 20).filter(o => ['Processing','Confirmed'].includes(o.status));
    if (!cancellable.length) return {
      text: 'You have no orders that can be cancelled right now. Orders that are Shipped or Delivered cannot be cancelled.',
      actions: [{ type: 'go_orders' }],
      followUps: ['Show my recent orders', 'What is in my cart?', 'Continue shopping'],
    };
    return {
      text: `Which order would you like to cancel?\n\n${
        cancellable.map(o => `• **#${o.id}** — ${o.status} — $${o.total?.toFixed(2)}`).join('\n')
      }`,
      actions: cancellable.map(o => ({ type: 'cancel_order', orderId: o.id })),
      followUps: ['Show all my orders', 'What is in my cart?'],
    };
  }

  const orderId = match[1].toUpperCase();
  const order   = getUserOrders(user, 20).find(o => o.id.toUpperCase() === orderId);

  if (!order) return {
    text: `I couldn't find order **#${orderId}** in your account.`,
    actions: [{ type: 'go_orders' }],
    followUps: ['Show all my orders', 'What is in my cart?', 'Continue shopping'],
  };
  if (['Shipped','Delivered','Cancelled'].includes(order.status)) return {
    text: `Order **#${orderId}** is already **${order.status}** and can't be cancelled. 😔`,
    actions: [{ type: 'go_orders' }],
    followUps: ['Show all my orders', 'Continue shopping', 'How do returns work?'],
  };

  return {
    text: `I can cancel order **#${orderId}** (currently ${order.status}). This cannot be undone — shall I go ahead?`,
    actions: [{ type: 'cancel_order', orderId }],
    followUps: ['Show all my orders', 'What is in my cart?'],
  };
}

function localDeliveryResponse() {
  return {
    text: `🚚 **Delivery Info**\n\n• **Free delivery** on every order — no minimum spend\n• Estimated arrival: **1–2 hours** after you place your order\n• We deliver 7 days a week\n• You'll get a notification when your order is on its way`,
    actions: [{ type: 'go_shop' }],
    followUps: ['What payment methods do you accept?', 'How do returns work?', 'What is in my cart?'],
  };
}

function localPaymentResponse() {
  return {
    text: `💳 **Payment Methods**\n\n• Visa\n• Mastercard\n• American Express (Amex)\n\nAll payments are processed securely. In demo mode you can use test cards — just look for the "Test Cards" section at checkout.`,
    actions: [{ type: 'go_checkout' }],
    followUps: ['How does delivery work?', 'What is in my cart?', 'Show my recent orders'],
  };
}

function localReturnsResponse() {
  return {
    text: `🔄 **Returns & Refunds**\n\n• Full refund or replacement — no questions asked\n• Refunds processed in **3–5 business days**\n• Just contact us within 7 days of delivery\n• Perishable items: contact us within 24 hours`,
    actions: [],
    followUps: ['Show my recent orders', 'How does delivery work?', 'What is in my cart?'],
  };
}

function localHoursResponse() {
  return {
    text: `🕐 **We're always open!** FreshMart operates 24/7 online.\n\nOrders placed anytime are delivered within 1–2 hours during operating hours (7am–11pm).`,
    actions: [{ type: 'go_shop' }],
    followUps: ['How does delivery work?', 'What fresh produce do you have?', 'What are your best sellers?'],
  };
}

function localHelpResponse() {
  return {
    text: `👋 Here's what I can help you with:\n\n🛒 **Shopping** — find products, check prices, get recommendations\n📦 **Orders** — view order history, track status\n✕ **Cancellations** — cancel pending orders\n🚚 **Delivery** — times, costs, policies\n💳 **Payments** — accepted methods\n🔄 **Returns** — refund process`,
    actions: [{ type: 'go_shop' }],
    followUps: ['What is in my cart?', 'Show my recent orders', 'What fresh produce do you have?'],
  };
}

function formatProducts(prods) {
  return prods.map(p => `${p.emoji} **${p.name}** — $${p.price} (${p.weight}${p.badge ? ' · ' + p.badge : ''})`).join('\n');
}

function localProductResponse(category, label, emoji) {
  const prods = BY_CATEGORY[category] || [];
  if (!prods.length) return { text: `Sorry, we don't have any ${label} right now.`, actions: [{ type: 'go_shop' }], followUps: ['Show all products', 'What are your best sellers?'] };
  return {
    text: `${emoji} **${label}** (${prods.length} items):\n\n${formatProducts(prods)}`,
    actions: [{ type: 'go_shop' }],
    followUps: ['What is in my cart?', 'Show dairy products', 'What are your best sellers?'],
  };
}

function localBestsellersResponse() {
  const stars = products.filter(p => ['Best Seller','Popular','Organic'].includes(p.badge));
  const show  = stars.length ? stars : products.slice(0, 6);
  return {
    text: `⭐ **Top picks at FreshMart:**\n\n${formatProducts(show)}`,
    actions: [{ type: 'go_shop' }],
    followUps: ['What fresh produce do you have?', 'What is in my cart?', 'How does delivery work?'],
  };
}

function localBudgetResponse() {
  const cheap = [...products].sort((a,b) => a.price - b.price).slice(0, 6);
  return {
    text: `💰 **Best value products:**\n\n${formatProducts(cheap)}`,
    actions: [{ type: 'go_shop' }],
    followUps: ['What are your best sellers?', 'What is in my cart?', 'How does delivery work?'],
  };
}

function localPricesResponse() {
  const sorted = [...products].sort((a,b) => a.price - b.price);
  const lines  = sorted.map(p => `${p.emoji} ${p.name} — **$${p.price}**`).join('\n');
  return {
    text: `💲 **Full price list:**\n\n${lines}`,
    actions: [{ type: 'go_shop' }],
    followUps: ['What are your cheapest products?', 'What is in my cart?', 'How does delivery work?'],
  };
}

// ── Render markdown ──────────────────────────────────────────────────────────
function md(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

// ── Quick replies ────────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  { label: '🥦 Fresh produce',   text: 'What fresh produce do you have?' },
  { label: '🛒 My cart',         text: 'What is in my cart?' },
  { label: '📦 My orders',       text: 'Show my recent orders' },
  { label: '✕ Cancel order',     text: 'I want to cancel an order' },
  { label: '🚚 Delivery info',   text: 'How does delivery work?' },
  { label: '💰 Best sellers',    text: 'What are your most popular products?' },
];

// ── Contextual follow-up suggestions (pure function — no hook needed) ────────
function getAiFollowUps(userText) {
  const t = userText.toLowerCase();
  if (t.includes('produce') || t.includes('fruit') || t.includes('vegetable'))
    return ['What dairy products do you have?', 'What is in my cart?', 'How does delivery work?'];
  if (t.includes('delivery') || t.includes('deliver'))
    return ['What is in my cart?', 'Show my recent orders', 'What payment methods do you accept?'];
  if (t.includes('payment') || t.includes('pay') || t.includes('card'))
    return ['What is in my cart?', 'How does delivery work?', 'Show my recent orders'];
  if (t.includes('recipe') || t.includes('cook') || t.includes('ingredient'))
    return ['What fresh produce do you have?', 'What are your best sellers?', 'What is in my cart?'];
  if (t.includes('popular') || t.includes('best seller') || t.includes('recommend'))
    return ['What fresh produce do you have?', 'What is in my cart?', 'How does delivery work?'];
  if (t.includes('return') || t.includes('refund'))
    return ['Show my recent orders', 'What is in my cart?', 'How does delivery work?'];
  return ['What is in my cart?', 'Show my recent orders', 'What are your best sellers?'];
}

// ════════════════════════════════════════════════════════════════════════════
export default function AiChatbot() {
  const { items: cartItems, total: cartTotal } = useCart();
  const { user } = useAuth();

  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unread,   setUnread]   = useState(0);

  const [cancelTarget,  setCancelTarget]  = useState(null);
  const [cancelledIds,  setCancelledIds]  = useState({});
  const [cancelBusy,    setCancelBusy]    = useState(false);

  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const historyRef   = useRef([]);   // only AI turns (not local ones)
  const lastCallRef  = useRef(0);

  // ── Welcome ────────────────────────────────────────────────────────────────
  const welcome = useCallback(() => ({
    role: 'bot', actions: [], time: new Date(),
    text: user
      ? `Hi **${user.name.split(' ')[0]}**! 👋 I'm FreshBot. Ask me about products, your cart, orders, delivery, or anything FreshMart!`
      : `Hi there! 👋 I'm **FreshBot**. I can help with products and store info.\n\nFor cart and order details, please sign in first.`,
  }), [user]);

  useEffect(() => {
    setMessages([welcome()]);
    historyRef.current = [];
    setCancelledIds({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 120); } }, [isOpen]);

  // ── Add a bot message ───────────────────────────────────────────────────────
  const addBot = (text, actions = [], followUps = []) => {
    setMessages(prev => [...prev, { role: 'bot', text, actions, followUps, time: new Date() }]);
  };

  // ── Countdown timer state ────────────────────────────────────────────────────
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const cooldownRef = useRef(null);

  const startCooldown = useCallback((seconds) => {
    setCooldown(seconds);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Call Gemini with auto-retry on 429 ───────────────────────────────────────
  const callGemini = useCallback(async (userText, attempt = 0) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    console.log('[FreshBot] callGemini attempt', attempt, '| key present:', !!apiKey, '| key prefix:', apiKey.slice(0,8));

    if (!apiKey) {
      return {
        text: `⚠️ **Gemini API key not configured.**\n\n1. Create a \`.env\` file in your project root (same folder as package.json)\n2. Add this line: \`REACT_APP_GEMINI_API_KEY=your_key_here\`\n3. Get a free key at **aistudio.google.com**\n4. **Restart the dev server** (Ctrl+C then npm start)`,
        isError: true,
      };
    }

    // Client-side gap enforcement
    const now = Date.now();
    const gap = now - lastCallRef.current;
    if (gap < MIN_SEND_GAP) {
      const secs = Math.ceil((MIN_SEND_GAP - gap) / 1000);
      startCooldown(secs);
      return { text: `⏳ Sending too fast — waiting **${secs}s**...`, isError: true, silent: true };
    }

    lastCallRef.current = now;
    historyRef.current.push({ role: 'user', parts: [{ text: userText }] });
    if (historyRef.current.length > MAX_TURNS * 2)
      historyRef.current = historyRef.current.slice(-MAX_TURNS * 2);

    try {
      const res = await fetch(getGeminiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: historyRef.current,
          generationConfig: { temperature: 0.5, maxOutputTokens: 180, topP: 0.85 },
        }),
      });

      if (res.status === 429) {
        historyRef.current.pop();
        // Auto-retry with backoff
        if (attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attempt];
          const secs  = Math.ceil(delay / 1000);
          startCooldown(secs);
          // Show retrying message (replace last bot msg via flag)
          await new Promise(r => setTimeout(r, delay));
          return callGemini(userText, attempt + 1);
        }
        startCooldown(60);
        return {
          text: `⏳ **Gemini is rate-limited right now** (free tier: 15 req/min).

Please wait about a minute and try again, or use the quick-reply buttons below which don't use the API.`,
          isError: true,
        };
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP_${res.status}`);
      }

      const data    = await res.json();
      const replyTx = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I had trouble responding.';
      historyRef.current.push({ role: 'model', parts: [{ text: replyTx }] });
      return { text: replyTx };

    } catch (err) {
      historyRef.current.pop();
      console.error('[FreshBot] Gemini error:', err.message, err);
      if (err.message.includes('API_KEY_INVALID') || err.message.includes('INVALID_ARGUMENT')) {
        return { text: '❌ **Invalid API key.** Check your `.env` file and restart the dev server.', isError: true };
      }
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('CORS')) {
        return { text: `❌ **Network error** — could not reach Gemini API.\n\nCheck that your API key is correct in \`.env\` and restart the app. Error: ${err.message}`, isError: true };
      }
      return { text: `❌ **Error:** ${err.message}\n\nCheck the browser console (F12) for details.`, isError: true };
    }
  }, [startCooldown]);

  // ── Main send handler ───────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: trimmed, time: new Date() }]);

    const intent = detectIntent(trimmed);

    // ── Handle locally — no API call ──
    const LOCAL_MAP = {
      cart:        () => localCartResponse(user, cartItems, cartTotal),
      orders:      () => localOrdersResponse(user),
      cancel:      () => localCancelResponse(user, trimmed),
      delivery:    () => localDeliveryResponse(),
      payment:     () => localPaymentResponse(),
      returns:     () => localReturnsResponse(),
      hours:       () => localHoursResponse(),
      help:        () => localHelpResponse(),
      produce:     () => localProductResponse('fruits', 'Fresh Fruits & Vegetables', '🥦'),
      dairy:       () => localProductResponse('dairy', 'Dairy & Eggs', '🥛'),
      meat:        () => localProductResponse('meat', 'Meat & Seafood', '🥩'),
      bakery:      () => localProductResponse('bakery', 'Bakery', '🍞'),
      snacks:      () => localProductResponse('snacks', 'Snacks', '🍫'),
      beverages:   () => localProductResponse('beverages', 'Beverages', '🥤'),
      frozen:      () => localProductResponse('frozen', 'Frozen Foods', '🧊'),
      pantry:      () => localProductResponse('pantry', 'Pantry', '🫙'),
      bestsellers: () => localBestsellersResponse(),
      budget:      () => localBudgetResponse(),
      prices:      () => localPricesResponse(),
    };

    if (LOCAL_MAP[intent]) {
      const r = LOCAL_MAP[intent]();
      setTimeout(() => { setMessages(prev => [...prev, { role: 'bot', followUps: [], ...r, time: new Date() }]); }, 280);
      return;
    }

    // ── Call Gemini for AI answer ──
    setLoading(true);
    setIsTyping(true);
    const result = await callGemini(trimmed);
    setIsTyping(false);
    setLoading(false);
    const aiFollowUps = result.isError ? [] : getAiFollowUps(trimmed);
    setMessages(prev => [...prev, {
      role: 'bot', text: result.text, actions: [], followUps: aiFollowUps, time: new Date(), isError: result.isError,
    }]);
    if (!isOpen) setUnread(n => n + 1);
  }, [loading, user, cartItems, cartTotal, isOpen, callGemini]);

  // ── Cancel an order (verified against current user's account) ──────────────
  const doCancel = useCallback(() => {
    if (!cancelTarget || !user) return;
    setCancelBusy(true);

    const all   = JSON.parse(localStorage.getItem('freshmart_orders') || '[]');
    const order = all.find(o => o.id === cancelTarget && o.userId === user.id);

    setTimeout(() => {
      setCancelBusy(false);
      setCancelTarget(null);

      if (!order) {
        addBot(`❌ Order **#${cancelTarget}** not found in your account.`);
        return;
      }
      if (['Shipped','Delivered','Cancelled'].includes(order.status)) {
        addBot(`❌ Order **#${cancelTarget}** is already **${order.status}** and can't be cancelled.`);
        return;
      }

      const updated = all.map(o =>
        o.id === cancelTarget && o.userId === user.id
          ? { ...o, status: 'Cancelled', cancelledAt: new Date().toISOString() }
          : o
      );
      localStorage.setItem('freshmart_orders', JSON.stringify(updated));
      setCancelledIds(prev => ({ ...prev, [cancelTarget]: true }));
      addBot(
        `✅ Order **#${cancelTarget}** cancelled. Your refund will be processed in 3–5 business days. 💰`,
        [{ type: 'go_orders' }],
        ['Show all my orders', 'What is in my cart?', 'Continue shopping']
      );
    }, 700);
  }, [cancelTarget, user]);

  // ── Render action buttons + follow-up chips ─────────────────────────────────
  const renderActions = (actions, followUps) => {
    const hasActions = actions?.length > 0;
    const hasFollowUps = followUps?.length > 0;
    if (!hasActions && !hasFollowUps) return null;
    return (
      <div className="msg-actions-wrap">
        {hasActions && (
          <div className="msg-actions">
            {actions.map((a, i) => {
              if (a.type === 'needs_login') return (
                <React.Fragment key={i}>
                  <Link to="/login"    className="msg-action-btn primary"   onClick={() => setIsOpen(false)}>🔐 Sign In</Link>
                  <Link to="/register" className="msg-action-btn secondary" onClick={() => setIsOpen(false)}>✏️ Register</Link>
                </React.Fragment>
              );
              if (a.type === 'go_shop')     return <Link key={i} to="/shop"     className="msg-action-btn secondary" onClick={() => setIsOpen(false)}>🛒 Browse Shop</Link>;
              if (a.type === 'go_orders')   return <Link key={i} to="/orders"   className="msg-action-btn secondary" onClick={() => setIsOpen(false)}>📦 View Orders</Link>;
              if (a.type === 'go_checkout') return <Link key={i} to="/checkout" className="msg-action-btn primary"   onClick={() => setIsOpen(false)}>💳 Checkout Now</Link>;
              if (a.type === 'suggest_cancel') return (
                <button key={i} className="msg-action-btn danger-soft" onClick={() => sendMessage('I want to cancel an order')}>✕ Cancel an order</button>
              );
              if (a.type === 'cancel_order') {
                if (cancelledIds[a.orderId]) return <span key={i} className="msg-action-done">✅ Cancelled</span>;
                return (
                  <button key={i} className="msg-action-btn danger" onClick={() => setCancelTarget(a.orderId)}>
                    ✕ Cancel #{a.orderId}
                  </button>
                );
              }
              return null;
            })}
          </div>
        )}
        {hasFollowUps && (
          <div className="msg-followups">
            <p className="followups-label">You might also ask:</p>
            <div className="followups-chips">
              {followUps.map((q, i) => (
                <button key={i} className="followup-chip" onClick={() => sendMessage(q)} disabled={loading}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit  = (e) => { e.preventDefault(); sendMessage(input); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };
  const clearChat     = () => { historyRef.current = []; setMessages([welcome()]); setCancelledIds({}); };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* Cancel confirm modal */}
      {cancelTarget && (
        <div className="chat-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-dlg-title">
          <div className="chat-modal">
            <span style={{ fontSize: 40 }} aria-hidden="true">⚠️</span>
            <h4 id="cancel-dlg-title">Cancel order #{cancelTarget}?</h4>
            <p>This cannot be undone. A refund will be issued in 3–5 business days.</p>
            <div className="chat-modal-btns">
              <button className="chat-modal-confirm" onClick={doCancel} disabled={cancelBusy}>
                {cancelBusy ? 'Cancelling…' : 'Yes, cancel it'}
              </button>
              <button className="chat-modal-keep" onClick={() => setCancelTarget(null)}>Keep order</button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        className={`chatbot-toggle${isOpen ? ' open' : ''}`}
        onClick={() => setIsOpen(v => !v)}
        aria-label={isOpen ? 'Close FreshBot' : 'Open FreshBot'}
        aria-expanded={isOpen}
      >
        {isOpen
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
          : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {!isOpen && unread > 0 && <span className="chat-unread" aria-label={`${unread} unread`}>{unread}</span>}
      </button>

      {/* Chat window */}
      <div className={`chatbot-window${isOpen ? ' open' : ''}`} role="dialog" aria-label="FreshBot" aria-modal="false">

        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-avatar" aria-hidden="true">🤖</div>
          <div className="chatbot-title">
            <h3>FreshBot</h3>
            <span className="chatbot-status">
              <span className="status-dot" aria-hidden="true"/>
              {loading ? 'Thinking…' : 'Online · Gemini AI'}
            </span>
          </div>
          <div className="chatbot-header-actions">
            <button className="chat-action-btn" onClick={clearChat} aria-label="Clear chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.32"/></svg>
            </button>
            <button className="chat-action-btn" onClick={() => setIsOpen(false)} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" role="log" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}${msg.isError ? ' error' : ''}`}>
              {msg.role === 'bot' && <div className="msg-avatar" aria-hidden="true">🤖</div>}
              <div className="msg-bubble">
                <div className="msg-text" dangerouslySetInnerHTML={{ __html: md(msg.text) }} />
                {msg.role === 'bot' && renderActions(msg.actions, msg.followUps)}
                <span className="msg-time">{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-msg bot">
              <div className="msg-avatar" aria-hidden="true">🤖</div>
              <div className="msg-bubble typing-bubble" aria-label="FreshBot is typing"><span/><span/><span/></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies — only on first message */}
        {messages.length <= 1 && (
          <div className="quick-replies">
            <p className="quick-replies-label">Quick questions</p>
            <div className="quick-replies-grid">
              {QUICK_REPLIES.map((q, i) => (
                <button key={i} className="quick-reply-btn" onClick={() => sendMessage(q.text)} disabled={loading}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cooldown banner */}
        {cooldown > 0 && (
          <div className="cooldown-banner" role="status" aria-live="polite">
            <span className="cooldown-icon" aria-hidden="true">⏳</span>
            <span>Rate limited — ready in <strong>{cooldown}s</strong></span>
            <div className="cooldown-bar" style={{ width: `${Math.min(cooldown / 60 * 100, 100)}%` }} aria-hidden="true"/>
          </div>
        )}

        {/* Input */}
        <form className="chatbot-input-wrap" onSubmit={handleSubmit}>
          <label htmlFor="freshbot-input" className="sr-only">Message FreshBot</label>
          <textarea
            id="freshbot-input" ref={inputRef} className="chatbot-input"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={cooldown > 0 ? `Ready in ${cooldown}s…` : 'Ask me anything…'}
            rows={1} disabled={loading || cooldown > 0}
          />
          <button type="submit" className="chatbot-send" disabled={!input.trim() || loading || cooldown > 0} aria-label="Send">
            {loading
              ? <span className="send-spinner" aria-hidden="true"/>
              : cooldown > 0
                ? <span className="cooldown-count" aria-hidden="true">{cooldown}</span>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            }
          </button>
        </form>
        <p className="chatbot-footer">Enter to send · Shift+Enter for new line · Cart/orders answered instantly</p>
      </div>
    </>
  );
}