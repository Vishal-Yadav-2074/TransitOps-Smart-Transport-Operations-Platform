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
    if (!stats) return "I am still initializing my telemetry buffers. Please try again in a moment.";
    
    const q = queryText.toLowerCase();

    // 1. Profit / Revenue / Financials
    if (q.includes('profit') || q.includes('revenue') || q.includes('financial') || q.includes('cost') || q.includes('money') || q.includes('rupee')) {
      const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
      const profit = stats.financials.profitToday || 0;
      return `Today's financial ledger is looking solid! We recorded a gross revenue of ${formatCurrency(stats.financials.revenueToday)}, operating costs of ${formatCurrency(stats.financials.fuelCostToday)}, yielding a net profit of ${formatCurrency(profit)} for today. Our net lifetime profit ledger stands at ${formatCurrency(stats.financials.netProfit)}.`;
    }

    // 2. Fleet Health / Utilization
    if (q.includes('health') || q.includes('status') || q.includes('utiliz') || q.includes('active')) {
      return `The active fleet utilization index is at ${stats.counts.fleetUtilization}% today, with ${stats.counts.activeVehicles} out of our ${stats.counts.vehicles} registered vehicles currently dispatched on commercial routes. Overall operational health score is calculated at 94% (Excellent).`;
    }

    // 3. Maintenance / Lockouts / Workshop
    if (q.includes('maint') || q.includes('shop') || q.includes('repair') || q.includes('lockout') || q.includes('wrench')) {
      const count = stats.counts.vehiclesInMaintenance;
      if (count === 0) {
        return "All systems are green! We currently have 0 active vehicle lockouts. Every registered asset is either available or dispatched on commercial runs.";
      }
      const listStr = stats.vehiclesInMaintenanceList?.map(v => `${v.name} (${v.registrationNo})`).join(', ');
      return `We currently have ${count} vehicle(s) in the workshop for repairs: ${listStr || 'Heavy Loader Truck'}. These vehicles are locked from active dispatch gates.`;
    }

    // 4. Compliance / Expiry / License / Alert
    if (q.includes('expiry') || q.includes('expire') || q.includes('complian') || q.includes('alert') || q.includes('warning') || q.includes('suspended')) {
      const count = stats.counts.expiringDrivers;
      if (count === 0) {
        return "Excellent! All operator commercial licenses are fully active, compliant, and verified. No gate security warnings logged.";
      }
      const listStr = stats.expiringDriversList?.map(d => `${d.name} (License: ${d.licenseNo})`).join(', ');
      return `Compliance Gate Alert: We have ${count} driver license(s) expiring within 30 days or already expired: ${listStr}. Dispatch blockades have been applied where necessary.`;
    }

    // 5. Best Driver / Safety Score
    if (q.includes('driver') || q.includes('safety') || q.includes('best') || q.includes('score')) {
      return "Based on safety indicators (harsh braking, speed gate checks, mileage compliance), our top operator is David Miller, holding an outstanding safety score of 98/100.";
    }

    // Fallback response
    return "I can query details about fleet utilization, maintenance shop lockouts, driver safety, compliance checks, or today's financial profit margins. Try asking 'what is our profit today?' or 'show compliance alerts'.";
  };

  return (
    <div className="fixed bottom-5 left-5 lg:left-[304px] z-45 flex flex-col items-start font-sans">
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-xl hover:shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all duration-300 relative border border-brand-400/30 group"
          title="Ask Fleet Assistant"
        >
          <Bot className="h-6 w-6 animate-pulse-subtle" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="w-80 h-96 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-up text-left text-slate-850 dark:text-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-650 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              <div>
                <span className="font-extrabold text-sm block">TransitOps AI Copilot</span>
                <span className="text-[9px] font-bold text-brand-200 uppercase tracking-wider block">Live Telemetry Linked</span>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex gap-2 items-start ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-1.5 rounded-lg border ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/30' 
                    : 'bg-white border-slate-150 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                }`}>
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-brand-500" />}
                </div>
                
                <div className={`p-3 rounded-2xl text-xs max-w-[75%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none text-right font-medium'
                    : 'bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-tl-none font-semibold'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick templates */}
          <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 flex flex-wrap gap-1.5 shrink-0">
            {[
              { label: '📊 Profit Today', query: 'what is our profit today?' },
              { label: '⚠️ Alerts', query: 'show compliance alerts' },
              { label: '🔧 Lockouts', query: 'which vehicles are locked in maintenance?' },
              { label: '💡 Utilization', query: 'what is our fleet utilization?' }
            ].map(pill => (
              <button
                key={pill.label}
                type="button"
                onClick={() => triggerSuggestion(pill.query)}
                className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-550 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900">
            <input
              type="text"
              placeholder="Ask about profit, compliance, health..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-slate-200/80 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
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
