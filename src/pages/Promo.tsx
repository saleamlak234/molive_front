import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Share2, Send, X } from 'lucide-react';
import {env} from '../config/env';
import logo from '../assets/adv.jpeg';

const packages = [
  { id: 'pkg8', title: '8th Stock Package', buy: 'ETB 320,000', dailyReturn: 'ETB 11,040' },
  { id: 'pkg7', title: '7th Stock Package', buy: 'ETB 160,000', dailyReturn: 'ETB 5,520' },
  { id: 'pkg6', title: '6th Stock Package', buy: 'ETB 80,000', dailyReturn: 'ETB 2,750' },
  { id: 'pkg5', title: '5th Stock Package', buy: 'ETB 40,000', dailyReturn: 'ETB 1,350' },
  { id: 'pkg4', title: '4th Stock Package', buy: 'ETB 20,000', dailyReturn: 'ETB 670' },
  { id: 'pkg3', title: '3rd Stock Package', buy: 'ETB 10,000', dailyReturn: 'ETB 330' },
  { id: 'pkg2', title: '2nd Stock Package', buy: 'ETB 5,000', dailyReturn: 'ETB 162' },
  { id: 'pkg1', title: '1st Stock Package', buy: 'ETB 2,500', dailyReturn: 'ETB 80' },
];

export default function Promo() {
  const [copySuccess, setCopySuccess] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const navigate = useNavigate();

  const getPromoUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/promo`;
    }
    return `${env.DOMAIN || ''}/promo`;
  };

  const copyPromoLink = async (url: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopySuccess('Promo link copied automatically.');
      window.setTimeout(() => setCopySuccess(''), 4000);
    } catch {
      setCopySuccess('Unable to copy automatically. Please use the link below.');
    }
  };

  useEffect(() => {
    const url = getPromoUrl();
    setShareUrl(url);
    void copyPromoLink(url);
  }, []);

  const handleCopyLink = async () => {
    const url = shareUrl || getPromoUrl();
    await copyPromoLink(url);
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-emerald-50 sm:px-6 lg:px-8">
      <style>{`
        .card-3d{ perspective:1200px; }
        .card-3d .inner{ transform-style:preserve-3d; will-change:transform; transition:transform 1200ms cubic-bezier(.22,.9,.37,1); border-radius:inherit; position:relative; overflow:hidden; }
        .card-3d .inner::before{ content:''; position:absolute; inset:0; border-radius:inherit; background:linear-gradient(120deg, rgba(255,255,255,0.04), rgba(0,0,0,0.03)); pointer-events:none; }
        /* glossy shine overlay */
        .card-3d .inner::after{ content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; border-radius:inherit; background:linear-gradient(120deg, rgba(255,255,255,0.0) 30%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.0) 70%); transform:rotate(25deg) translateX(-100%); opacity:0; pointer-events:none; filter:blur(10px); }
        @keyframes shine{ 0%{ transform:rotate(25deg) translateX(-100%); opacity:0 } 20%{ opacity:0.6 } 50%{ transform:rotate(25deg) translateX(0%); opacity:0.9 } 80%{ opacity:0.6 } 100%{ transform:rotate(25deg) translateX(100%); opacity:0 }
        }
        @keyframes float3d{ 0%{ transform:rotateX(0deg) rotateY(0deg) translateY(0px);} 25%{ transform:rotateX(2deg) rotateY(-3deg) translateY(-4px);} 50%{ transform:rotateX(0deg) rotateY(0deg) translateY(0px);} 75%{ transform:rotateX(-2deg) rotateY(3deg) translateY(-4px);} 100%{ transform:rotateX(0deg) rotateY(0deg) translateY(0px);} }
        .animate-3d{ animation:float3d 10s ease-in-out infinite; }
        .shine-slow{ animation: shine 12s linear infinite; }
        .card-3d .inner.shine-slow::after{ animation: shine 12s linear infinite; }
      `}</style>
      <div className="mx-auto max-w-6xl rounded-[36px] border border-emerald-200 bg-white shadow-xl relative">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Close promo"
          className="absolute z-20 inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow top-4 right-4 text-emerald-700 hover:bg-emerald-50"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Facebook Promo Template
            </p>
            <h1 className="max-w-2xl text-3xl font-extrabold text-slate-900 sm:text-4xl">
              የውል የገቢ ፕሮሞሽን ይፍጠሩ እና በFacebook ይጋሩ
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              This promo page renders your package offer and creates a share link. Use the link below when posting to Facebook.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition rounded-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Share2 className="w-4 h-4" />
                Copy promo link
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition bg-white border rounded-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                Open promo page
                <ArrowRight className="w-4 h-4" />
              </a>
              {/* Close handled by top-right X button */}
            </div>
            {copySuccess && (
              <p className="text-sm text-emerald-700">{copySuccess}</p>
            )}
            <div className="mt-4">
              <a
                href={env.TELEGRAM_CHANNEL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white transition bg-emerald-600 border border-emerald-600 rounded-full hover:bg-emerald-700"
              >
                <Send className="w-4 h-4" />
                Join our Telegram channel
              </a>
            </div>
          </div>

          <div className="grid gap-6 rounded-[30px] bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 p-6 text-white shadow-2xl sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-100/80">አሁን ይገናኙ</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">ዕለታዊ ትርፍ ከእርስዎ ፓኬጆች</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-100/90">
                Share the link and let users see your daily return package offer with referral rewards.
              </p>
              <div className="mt-6 space-y-3 text-sm text-emerald-100/90">
                <p>• የዕለት ተመን ትርፍ ከምርጥ ፓኬጆች</p>
                <p>• እርስዎ ሲገባ በቀላሉ ይስራሉ</p>
                <p>• የL1 8%, L2 6%, L3 4% የሪፈራል ሽልማት</p>
                <p>• የL1 5%, L2 3%, L3 1% ቪድዮ  እይታ  ሽልማት</p>
                <p>• ከ 49 - 2499 ETB  የቀን ሪፈራል  ሽልማት</p>
              </div>
            </div>
            <div className="card-3d">
              <div className="inner animate-3d shine-slow relative flex items-center justify-center overflow-hidden rounded-[30px] bg-emerald-800/90 p-5">
                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-emerald-900/70 via-emerald-800/30 to-transparent"></div>
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <div className="overflow-hidden border-white rounded-full shadow-2xl border-6">
                    <img src={logo} alt="Promo person" className="object-cover w-40 h-40 sm:h-56 sm:w-56" />
                  </div>
                  <p className="text-lg font-semibold">ምርጥ ፕሮሞ ሰው</p>
                  <p className="max-w-xs text-sm leading-6 text-emerald-100/90">
                    እንኳን በደህና መጡ! ይህ ፕሮሞ የእርስዎን የዕለታዊ ትርፍ ፕላን ይገልፃል።
                  </p>
                  <span className="inline-flex px-4 py-2 text-sm text-white rounded-full bg-white/10">
                    ዝርዝር ለማየት አሁን ይጫኑ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-8 pb-10 lg:grid-cols-3 lg:px-10">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card-3d">
              <div className="inner animate-3d shine-slow rounded-[28px] border border-emerald-200 bg-emerald-600 p-6 shadow-sm">
                <p className="mt-4 text-2xl font-extrabold text-white">
                  {`በ ${pkg.buy.replace('ETB ','')} ሲገቡ ${pkg.dailyReturn.replace('ETB ','')} ETB በየቀኑ  ያግኙ`}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[30px] border-t border-emerald-100 bg-emerald-50 px-8 py-8 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Referral bonus</p>
            <p className="mt-3 text-xl font-bold text-emerald-700">L1 → 8%   L2 → 6%   L3 → 4%</p>
            <p className="mt-3 text-xl font-bold text-emerald-700"> Daily Direct referral bonus: 49 - 2,499 ETB</p>
            <p className="mt-3 text-xl font-bold text-emerald-700"> Daily Video referral bonus: L1 → 5%   L2 → 3%   L3 → 1%</p>
            </div>
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">How to use</p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>1. Copy the promo link.</li>
                <li>2. Paste it into a Facebook post or ad.</li>
                <li>3. Facebook will open the promo page link.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
