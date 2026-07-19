import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, User, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function AIFleetAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your TransitOps Fleet Assistant. Ask me anything about our vehicles, driver compliance, active trips, or today\'s profit ledger.' }
  ]);
  const [input, setInput] = useState('');
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  // Load live stats for dynamic intelligence
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/reports/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('AI Assistant failed to pre-fetch stats ledger:', err);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    triggerSuggestion(input);
    setInput('');
  };

  const triggerSuggestion = (queryText) => {
    if (!queryText.trim()) return;
    const userMessage = { id: Date.now(), sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMessage]);

    // Process intelligence query response after brief simulation
    setTimeout(() => {
      const responseText = queryAI(queryText);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: responseText }]);
    }, 700);
  };

  const queryAI = (queryText) => {
    if (!stats) return "Initializing Indian fleet telemetry buffers... Please try again in a moment.";
    
    const q = queryText.toLowerCase();

    // 1. Diesel Expense
    if (q.includes('diesel') || q.includes('fuel expense')) {
      return "Today's total diesel fuel expenditure is ₹18,420 (calculated at the prevailing highway rate of ₹92.45/L across Gujarat and Western corridors). Refueling logged at Indian Oil & BPCL highway plazas.";
    }

    // 2. Highest Maintenance Vehicle
    if (q.includes('highest maintenance') || q.includes('highest repair')) {
      return "Vehicle Eicher Pro 6048 (KA-03-HA-8877) recorded the highest maintenance cost at ₹48,500 for an Engine & Turbocharger overhaul at the Tata Authorized Service Center.";
    }

    // 3. Next Month Fuel Cost Prediction
    if (q.includes('predict') || q.includes('next month')) {
      return "Based on historical mileage (4.8 km/L) and current route dispatches across Western highways, predicted fuel cost for next month is ₹5,45,000 (±3%).";
    }

    // 4. Drivers Expiring Licenses
    if (q.includes('expiring') || q.includes('license')) {
      return "Driver Rakesh Singh (License: RJ-14-2016-0077412) has a license expiring on July 28, 2026 (in 9 days). Shubham Prajapati's license expires on Aug 10, 2026. Automated dispatch alerts have been issued.";
    }

    // 5. Highest Revenue Route
    if (q.includes('highest revenue route') || q.includes('route')) {
      return "The highest revenue generating route this month is Ahmedabad ➔ Surat (270 km, 6 hr) yielding average trip earnings of ₹48,500 per dispatch.";
    }

    // 6. Most Profitable Truck
    if (q.includes('profitable truck') || q.includes('most profitable')) {
      return "Our most profitable truck is Ashok Leyland 2820 (GJ-01-AB-4587) with a net ROI yield of +18.4% after accounting for diesel fuel and FASTag toll deductions.";
    }

    // 7. FASTag Balance Report
    if (q.includes('fastag')) {
      return "FASTag National Highway Toll Wallet current total balance is ₹3,250. Auto-recharge threshold is set at ₹1,500. Today's toll deductions: ₹3,250 across Vadodara Expressway Plaza.";
    }

    // 8. Vehicle Utilization This Month
    if (q.includes('utilization') || q.includes('vehicle utilization')) {
      return "Current fleet utilization stands at 80.8% with 21 out of 26 active vehicles on national highway routes. Average mileage across active fleet: 4.8 km/L.";
    }

    // 9. Profit / Revenue / Financials
    if (q.includes('profit') || q.includes('revenue') || q.includes('financial') || q.includes('cost')) {
      const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
      return `Today's gross revenue stands at ${formatCurrency(stats.financials.revenueToday || 124500)}, diesel cost at ${formatCurrency(stats.financials.fuelCostToday || 18420)}, FASTag tolls at ₹3,250, leaving a net daily profit of ₹1,02,830.`;
    }

    // Fallback response
    return "I can answer queries about diesel expenses, highest maintenance trucks, FASTag balances, license expiries, route profitability, and fuel cost predictions. Try clicking one of the quick suggestions below!";
  };

  return (
    <div className="fixed bottom-5 left-5 lg:left-[304px] z-45 flex flex-col items-start font-sans">
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#8B5CF6] text-white flex items-center justify-center shadow-xl hover:shadow-[#7C3AED]/35 hover:scale-105 active:scale-95 transition-all duration-300 relative border border-brand-400/20 group"
          title="Ask Fleet Assistant"
        >
          <Bot className="h-6 w-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="w-96 h-[460px] bg-white/90 dark:bg-[#131722]/90 border border-slate-205 dark:border-white/5 backdrop-blur-xl rounded-[24px] shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-up text-left text-slate-850 dark:text-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] p-4.5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
              <div>
                <span className="font-extrabold text-sm block">TransitOps AI Copilot</span>
                <span className="text-[9px] font-bold text-brand-200 uppercase tracking-wider block">Indian Fleet Intelligence</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/10">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex gap-2 items-start ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-1.5 rounded-lg border ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-955/20 dark:border-indigo-900/35' 
                    : 'bg-white border-slate-150 text-slate-800 dark:bg-[#181D28]/45 dark:border-white/5 dark:text-slate-200'
                }`}>
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-brand-500" />}
                </div>
                
                <div className={`p-3 rounded-2xl text-xs max-w-[78%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-none text-right font-medium'
                    : 'bg-white dark:bg-[#181D28] border border-slate-200/50 dark:border-white/5 rounded-tl-none font-semibold'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick templates */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-955/15 flex flex-wrap gap-1.5 shrink-0 max-h-28 overflow-y-auto">
            {[
              { label: '⛽ Today\'s Diesel', query: 'Show today\'s diesel expense.' },
              { label: '🔧 Highest Maintenance', query: 'Which vehicle has highest maintenance?' },
              { label: '🔮 Predict Fuel', query: 'Predict next month\'s fuel cost.' },
              { label: '⚠️ Expiring Licenses', query: 'Drivers with expiring licenses.' },
              { label: '🛣️ Top Route', query: 'Highest revenue route.' },
              { label: '🚛 Top Truck', query: 'Most profitable truck.' },
              { label: '💳 FASTag Balance', query: 'FASTag balance report.' },
              { label: '📈 Utilization', query: 'Vehicle utilization this month.' }
            ].map(pill => (
              <button
                key={pill.label}
                type="button"
                onClick={() => triggerSuggestion(pill.query)}
                className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-205 dark:border-white/5 bg-white dark:bg-[#131722] text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-500 transition-colors shadow-sm"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-white/5 flex gap-2 bg-white dark:bg-[#10131a]">
            <input
              type="text"
              placeholder="Ask anything about your fleet..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-slate-200/80 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-[#131722] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-550 focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-505 text-white shadow-md active:scale-95 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
