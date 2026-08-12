'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';

const suggestions = [
  {
    id: '2',
    username: 'akshaykumar',
    displayName: 'Akshay Kumar',
    avatar: 'https://images.pexels.com/photos/1382735/pexels-photo-1382735.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true
  },
  {
    id: '3',
    username: 'rashtrapatibhvn',
    displayName: 'President of India',
    avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true
  }
];

const taskPlans = [
  {
    id: 'Bronze',
    name: 'Bronze',
    tagline: 'Essential tier access',
    price: '100',
    subtext: 'Billed monthly • Up to 3 tweets/mo maximum',
    features: [
      { 
        text: 'Post up to 3 tweets maximum', 
        badge: null,
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
      },
      { 
        text: 'Verified bronze checkmark metric', 
        badge: null,
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      },
      { 
        text: 'Standard creator tools support', 
        badge: null,
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L7.9 4.9 4.9 7.9 1.7 4.7C.6 7.1 1 10.1 3 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.4-.4.4-1.1 0-1.4z"/></svg>
      },
      { 
        text: 'Electronic invoice generation', 
        badge: 'invoice',
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
      }
    ]
  },
  {
    id: 'Silver',
    name: 'Silver',
    tagline: 'Most Popular Choice',
    price: '300',
    subtext: 'Billed monthly • Up to 5 tweets/mo maximum',
    features: [
      { 
        text: 'Post up to 5 tweets maximum', 
        badge: null,
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
      },
      { 
        text: 'Priority algorithmic feed visibility', 
        badge: 'BOOST',
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6z"/></svg>
      },
      { 
        text: 'Enhanced search indexing filters', 
        badge: null,
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      },
      { 
        text: 'Electronic invoice generation', 
        badge: 'invoice',
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
      }
    ]
  },
  {
    id: 'Gold',
    name: 'Gold',
    tagline: 'Unlimited power capabilities',
    price: '1000',
    subtext: 'Billed monthly • Unlimited tweeting unlocked',
    features: [
      { 
        text: 'Unlimited tweeting capabilities', 
        badge: 'UNLIMITED',
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
      },
      { 
        text: 'Official Premium gold verification icon', 
        badge: null,
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
      },
      { 
        text: 'Direct 24/7 prioritized helpline', 
        badge: null,
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.04 15.04 0 0 1-6.59-6.59l2.2-2.21a1 1 0 0 0 .24-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/></svg>
      },
      { 
        text: 'Electronic invoice generation', 
        badge: 'invoice',
        icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-500 flex-shrink-0 mt-0.5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
      }
    ]
  }
];

const featureComparisonTable = [
  {
    category: "Enhanced Experience",
    rows: [
      { feature: "Tweet Posting Cap", bronze: "3 Tweets", silver: "5 Tweets", gold: "Unlimited" },
      { feature: "Ads", bronze: "Standard Ads", silver: "Half in For You", gold: "Fully ad-free" },
      { feature: "Reply boost", bronze: "Standard", silver: "Larger", gold: "Largest" },
      { feature: "Radar access", bronze: "✕", silver: "✕", gold: "✓" },
      { feature: "Edit post", bronze: "✓", silver: "✓", gold: "✓" },
      { feature: "Longer posts", bronze: "✓", silver: "✓", gold: "✓" },
      { feature: "Background video playback", bronze: "✓", silver: "✓", gold: "✓" }
    ]
  },
  {
    category: "Creator Hub",
    rows: [
      { feature: "Write Articles", bronze: "✓", silver: "✓", gold: "✓" },
      { feature: "Get paid to post", bronze: "✕", silver: "✓", gold: "✓" },
      { feature: "Creator Subscriptions", bronze: "✓", silver: "✓", gold: "✓" },
      { feature: "X Pro (TweetDeck)", bronze: "✕", silver: "✕", gold: "✓" },
      { feature: "Media Studio", bronze: "✓", silver: "✓", gold: "✓" },
      { feature: "Analytics metrics", bronze: "✓", silver: "✓", gold: "✓" }
    ]
  },
  {
    category: "Verification & Security",
    rows: [
      { feature: "Checkmark status icon", bronze: "Bronze Icon", silver: "Blue Icon", gold: "Gold Icon" },
      { feature: "Optional ID verification", bronze: "✓", silver: "✓", gold: "✓" }
    ]
  }
];

export default function RightSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('Bronze');
  const [loading, setLoading] = useState(false);
  
  // Custom states to track time restriction lockout warning modal parameters
  const [lockModal, setLockModal] = useState({ isOpen: false, message: "" });

  const userEmail = "ksai69583@gmail.com";
  const activePlanDetails = taskPlans.find(p => p.id === selectedPlanId)!;

  const displayPrice = isYearly 
    ? Math.floor(Number(activePlanDetails.price) * 12 * 0.85).toLocaleString()
    : activePlanDetails.price;

  useEffect(() => {
    document.title = isModalOpen ? "Upgrade to Premium / X" : "(1) Home / X";
    return () => { document.title = "(1) Home / X"; };
  }, [isModalOpen]);

  const handleSubscribeSubmit = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: activePlanDetails.name }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Intercept 403 response thrown by the checkPaymentWindow time check middleware
        if (response.status === 403) {
          setLockModal({ isOpen: true, message: data.error || data.message });
        } else {
          alert(`Gateway Rejection: ${data.error || data.message || "Order Creation Failed"}`);
        }
        return;
      }

      const finalizedAmount = isYearly 
        ? Math.floor(data.amount * 12 * 0.85) 
        : data.amount;

      const options = {
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_TEgQ1glvXXVnhK",
        amount: finalizedAmount, 
        currency: data.currency,
        name: "X Premium Plan",
        description: `Upgrade to ${activePlanDetails.name} (${isYearly ? 'Annual' : 'Monthly'})`,
        order_id: data.id,
        handler: async function (authResponse: any) {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const verifyRes = await fetch(`${backendUrl}/api/payment/success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              planName: activePlanDetails.name,
              razorpay_payment_id: authResponse.razorpay_payment_id
            })
          });
          const verifyData = await verifyRes.json();
          alert(verifyData.message);
          setIsModalOpen(false);
          window.location.reload();
        },
        prefill: { email: userEmail },
        theme: { color: "#000000" }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert("Network connectivity error processing checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans antialiased text-foreground">
      {/* 1. Search Component */}
      <div className="relative sticky top-0 bg-background pt-1 pb-2 z-20">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none pt-1">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-muted-foreground"><path d="M16.572 15.158l5.711 5.711-1.414 1.414-5.711-5.711-.322.252a8.5 8.5 0 111.484-1.484l-.252.322zM10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13z"/></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full bg-muted border border-transparent focus:border-primary focus:bg-background text-foreground rounded-full pl-12 pr-5 py-2.5 text-sm outline-none placeholder-muted-foreground"
        />
      </div>

      {/* 2. Subscribe Banner Box */}
      <div className="border border-border rounded-2xl p-4 space-y-2 bg-card">
        <h3 className="font-black text-xl text-foreground tracking-tight">Subscribe to Premium</h3>
        <p className="text-foreground text-[15px] font-medium leading-5">Get rid of ads, see your analytics, boost your replies and unlock 20+ features.</p>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-full transition text-[15px] duration-200 mt-1"
        >
          Subscribe
        </button>
      </div>

      {/* 3. Today's News */}
      <div className="border border-border rounded-2xl p-4 space-y-4 bg-card">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-black text-xl text-foreground tracking-tight">Today's News</h3>
          <button className="p-1.5 hover:bg-accent rounded-full transition"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-5">
          <div className="cursor-pointer group">
            <h4 className="font-bold text-[15px] text-foreground leading-5 group-hover:underline">Elon Musk Unveils Terafab Texas as World's Largest Chip Factory</h4>
            <div className="flex items-center text-xs text-muted-foreground mt-1.5 gap-1">
              <span className="flex -space-x-1">
                <img src="https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=30" className="w-4 h-4 rounded-full border border-card" />
                <img src="https://images.pexels.com/photos/1382735/pexels-photo-1382735.jpeg?auto=compress&cs=tinysrgb&w=30" className="w-4 h-4 rounded-full border border-card" />
              </span>
              <span>3 days ago · News · 207.5K posts</span>
            </div>
          </div>
          <div className="cursor-pointer group">
            <h4 className="font-bold text-[15px] text-foreground leading-5 group-hover:underline">Varun Tej's Korean Kanakaraju Delivers Record Opening and Family Cheers</h4>
            <div className="flex items-center text-xs text-muted-foreground mt-1.5 gap-1">
              <span className="flex -space-x-1">
                <img src="https://images.pexels.com/photos/1382735/pexels-photo-1382735.jpeg?auto=compress&cs=tinysrgb&w=30" className="w-4 h-4 rounded-full border border-card" />
                <img src="https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=30" className="w-4 h-4 rounded-full border border-card" />
              </span>
              <span>2 days ago · Entertainment · 49.1K posts</span>
            </div>
          </div>
          <div className="cursor-pointer group">
            <h4 className="font-bold text-[15px] text-foreground leading-5 group-hover:underline">Mahesh Babu Celebrates Birthday with Varanasi Character Stills</h4>
            <div className="flex items-center text-xs text-muted-foreground mt-1.5 gap-1">
              <span className="flex -space-x-1">
                <img src="https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=30" className="w-4 h-4 rounded-full border border-card" />
              </span>
              <span>2 days ago · Entertainment · 349.9K posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. What's happening */}
      <div className="border border-border rounded-2xl p-4 space-y-4 bg-card">
        <h3 className="font-black text-xl text-foreground tracking-tight">What's happening</h3>
        <div className="space-y-5">
          <div className="cursor-pointer group flex justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Only on X · Trending</div>
              <h4 className="font-bold text-[15px] text-foreground mt-0.5">#MegaHitKokaForVarunTej</h4>
            </div>
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="cursor-pointer group flex justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Politics · Trending</div>
              <h4 className="font-bold text-[15px] text-foreground mt-0.5">Nancy</h4>
            </div>
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* 4. EXPANDED RESPONSIVE SCREEN WRAPPER MODAL */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex justify-center items-center z-[999] p-0 md:p-4 animate-fadeIn">
          <div className="bg-background w-full h-full md:h-[95vh] md:max-w-[1400px] md:w-[95vw] md:rounded-3xl border-0 md:border border-border overflow-hidden relative flex flex-col justify-between shadow-2xl">
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 left-6 p-2.5 rounded-full hover:bg-accent text-foreground z-50 transition"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
            </button>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-14 md:px-16 flex flex-col items-center pb-40 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              <h2 className="text-[28px] sm:text-[34px] md:text-[40px] font-black tracking-tight text-center text-foreground mb-8 max-w-3xl leading-tight">
                Choose the subscription plan that fits your profile
              </h2>

              <div className="flex bg-muted p-1 rounded-full w-full max-w-[280px] mb-10 border border-border">
                <button 
                  onClick={() => setIsYearly(false)}
                  className={`flex-1 py-2 text-[15px] font-bold rounded-full transition ${!isYearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setIsYearly(true)}
                  className={`flex-1 py-2 text-[15px] font-bold rounded-full transition ${isYearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Annual
                </button>
              </div>

              {/* 3-Column Parallel Plan Deck */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2 mb-16 items-stretch">
                {taskPlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const itemizedPrice = isYearly ? Math.floor(Number(plan.price) * 12 * 0.85).toLocaleString() : plan.price;
                  const intervalSuffix = isYearly ? '/ yr' : '/ mo';

                  return (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`cursor-pointer rounded-2xl bg-card border-2 p-6 md:p-8 transition flex flex-col justify-between ${isSelected ? 'border-sky-500 shadow-xl shadow-sky-500/10' : 'border-border hover:border-primary/50'}`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-[24px] font-black text-foreground tracking-tight">{plan.name}</h4>
                          {plan.id === 'Silver' && <span className="text-sky-500 text-xs font-black bg-sky-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Popular</span>}
                        </div>

                        <div className="flex items-baseline mb-5">
                          <span className="text-[36px] font-black text-foreground">₹{itemizedPrice}</span>
                          <span className="text-muted-foreground text-sm font-bold ml-1.5">{intervalSuffix}</span>
                        </div>
                        <p className="text-[14px] text-muted-foreground mb-6 h-10 leading-normal">{plan.tagline}</p>
                        <hr className="border-border mb-6" />

                        <ul className="space-y-4.5">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-[15px] font-bold text-foreground leading-snug gap-3">
                              <div className="pt-0.5">{feature.icon}</div>
                              <span>{feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compare Tiers Section */}
              <div className="w-full max-w-[1140px] space-y-8 px-2 text-left">
                <h3 className="text-2xl font-black text-foreground px-1 tracking-tight">Compare tiers & features</h3>
                
                {featureComparisonTable.map((cat, catIdx) => (
                  <div key={catIdx} className="bg-muted/40 border border-border rounded-2xl overflow-hidden shadow-md">
                    <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <div className="min-w-[600px]">
                        <div className="grid grid-cols-4 bg-muted px-6 py-4 border-b border-border text-xs font-black tracking-wider uppercase text-muted-foreground">
                          <span className="text-foreground text-[15px] font-black normal-case">{cat.category}</span>
                          <span className="text-center text-[13px]">Bronze</span>
                          <span className="text-center text-[13px]">Silver</span>
                          <span className="text-center text-[13px]">Gold</span>
                        </div>

                        <div className="divide-y divide-[#2f3336]">
                          {cat.rows.map((row, rowIdx) => (
                            <div key={rowIdx} className="grid grid-cols-4 px-6 py-4 text-sm items-center hover:bg-accent/50 transition">
                              <span className="text-foreground font-semibold text-[15px]">{row.feature}</span>
                              <span className="text-center font-black text-[13px] text-muted-foreground">{row.bronze}</span>
                              <span className="text-center font-black text-[13px] text-muted-foreground">{row.silver}</span>
                              <span className="text-center font-black text-[13px] text-sky-500">{row.gold}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-amber-500 text-xs text-center font-bold mt-12 bg-amber-500/10 border border-amber-500/20 py-2.5 px-8 rounded-full max-w-xl flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Task Gateway Window Constraint: Transactions check active server restrictions between 10:00 AM - 11:00 AM IST.</span>
              </p>
            </div>

            {/* Sticky summary bottom panel */}
            <div className="absolute bottom-0 inset-x-0 bg-background border-t border-border p-6 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-5 z-40 bg-background/95 backdrop-blur-md">
              <div className="text-center sm:text-left">
                <div className="text-xl font-black text-foreground flex items-baseline justify-center sm:justify-start gap-1">
                  <span>{activePlanDetails.name} Access Premium</span>
                  <span className="text-3xl font-black ml-1">₹{displayPrice}</span>
                  <span className="text-sm text-muted-foreground font-bold">{isYearly ? '/ year' : '/ month'}</span>
                </div>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">{activePlanDetails.subtext}</p>
              </div>

              <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                <button 
                  disabled={loading}
                  onClick={handleSubscribeSubmit}
                  className="w-full sm:w-[320px] bg-foreground hover:bg-foreground/90 text-background font-black text-[16px] py-3.5 px-8 rounded-full transition duration-200 shadow-xl flex justify-center items-center active:scale-[0.98] disabled:bg-zinc-700"
                >
                  {loading ? 'Processing Checkout...' : 'Subscribe & Pay'}
                </button>
              </div>
            </div>

          </div>
        </div>, document.body
      )}

      {/* 5. SMOOTH HIGH-PERFORMANCE TIME LOCK NOTIFICATION MODAL */}
      {typeof document !== 'undefined' && createPortal(
        <div 
          className={`fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-out ${
            lockModal.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div 
            className={`w-full max-w-md bg-background border border-border rounded-2xl text-foreground shadow-2xl transition-all duration-300 ease-out transform p-6 space-y-4 ${
              lockModal.isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
            }`}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Payment Window Locked</h3>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent transition-colors"
                onClick={() => setLockModal({ isOpen: false, message: "" })}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-600 leading-relaxed font-semibold">
                {lockModal.message || "Payments are only permitted between 10:00 AM and 11:00 AM IST."}
              </p>
            </div>
            
            <button
              className="w-full bg-foreground hover:bg-zinc-200 text-background font-bold py-2.5 rounded-full transition-colors text-sm"
              onClick={() => setLockModal({ isOpen: false, message: "" })}
            >
              Got it
            </button>
          </div>
        </div>, document.body
      )}

    </div>
  );
}