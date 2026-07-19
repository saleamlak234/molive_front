

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

// Define your translations (example)
const translations = {
  en: {
    referralRewards: 'Referral Rewards',
    referralDescription: 'Earn more rewards for every referral level you reach',
    twoReferrals: '2 Referrals',
    threeReferrals: '3 Referrals',
    fourReferrals: '4 Referrals',
    fiveReferrals: '5 Referrals',
    tenReferrals: '10 Referrals',
    earnOnTwo: 'Earn on 2 referrals',
    earnOnThree: 'Earn on 3 referrals',
    earnOnFour: 'Earn on 4 referrals',
    earnOnFive: 'Earn on 5 referrals',
    earnOnTen: 'Earn on 10 referrals',
    immediateRewards: 'Immediate rewards',
    directBonus: 'Direct bonus',
    betterReturns: 'Better returns',
    maximumBonus: 'Maximum bonus',
    topTier: 'Top tier rewards'
  },
  om: { // Oromo
    referralRewards: 'Badhaasa Itti aanaa',
    referralDescription: 'Badhaasa dabalataa argadhu sadarkaa rifaayinaa gahuu keetiin',
    twoReferrals: 'Itti aanaa 2',
    threeReferrals: 'Itti aanaa 3',
    fourReferrals: 'Itti aanaa 4',
    fiveReferrals: 'Itti aanaa 5',
    tenReferrals: 'Itti aanaa 10',
    earnOnTwo: 'Rifaayaa 2 irratti argadhu',
    earnOnThree: 'Rifaayaa 3 irratti argadhu',
    earnOnFour: 'Rifaayaa 4 irratti argadhu',
    earnOnFive: 'Rifaayaa 5 irratti argadhu',
    earnOnTen: 'Rifaayaa 10 irratti argadhu',
    immediateRewards: 'Badhaasa ariifachiisaa',
    directBonus: 'Buusii kallattii',
    betterReturns: 'Deebii gaarii',
    maximumBonus: 'Badhaasa olaanaa',
    topTier: 'Badhaasa sadarkaa ol aanaa'
  },
  am: { // Amharic
    referralRewards: 'የሪፈራል ሽልማት',
    referralDescription: 'ለየቀጥለው የሪፈራል ደረጃ ተጨማሪ ብር ይቀበላሉ',
    twoReferrals: '2 የሪፈራል ሰዎች',
    threeReferrals: '3 የሪፈራል ሰዎች',
    fourReferrals: '4 የሪፈራል ሰዎች',
    fiveReferrals: '5 የሪፈራል ሰዎች',
    tenReferrals: '10 የሪፈራል ሰዎች',
    earnOnTwo: 'በ2 ሪፈራል ላይ ገቢ',
    earnOnThree: 'በ3 ሪፈራል ላይ ገቢ',
    earnOnFour: 'በ4 ሪፈራል ላይ ገቢ',
    earnOnFive: 'በ5 ሪፈራል ላይ ገቢ',
    earnOnTen: 'በ10 ሪፈራል ላይ ገቢ',
    immediateRewards: 'ፈጣን ሽልማት',
    directBonus: 'ቀጥታ ብር',
    betterReturns: 'የተሻለ ተመላሽ',
    maximumBonus: 'ከፍተኛ ብር',
    topTier: 'ከፍተኛ ደረጃ ሽልማት',
    minimumStockPackage: 'ትንሹ የአክሲዮን ጥቅል',
    halfStockPackage: 'ግማሽ የአክሲዮን ጥቅል',
    fullStockPackage: 'ሙሉ የአክሲዮን ጥቅል',
    quarterStockPackage: 'ሩብ የአክሲዮን ጥቅል',
    completeStockMarketPackage: 'ከፍተኛ ትርፍ ያለው የተሟላ የአክሲዮን ገበያ ጥቅል',
    balancedInvestment: 'ለተረጋጋ እድገት ሚዛናዊ ኢንቨስትመንት',
    entryLevelPackage: 'ለመጀመሪያ ደረጃ ጥቅል',
    starterPackage: 'ለአዳዲስ ባለሀብቶች መነሻ ጥቅል',
    fullMarketAccess: 'ሙሉ የገበያ ተደራሽነት',
    premiumSupport: 'ፕሪሚየም ድጋፍ',
    dailyWithdrawals: 'ዕለታዊ ገንዘብ ማውጣት',
    maximumEarnings: 'ከፍተኛ ገቢ',
    marketAccess: 'የገበያ ተደራሽነት',
    standardSupport: 'መደበኛ ድጋፍ',
    goodReturns: 'ጥሩ ተመላሾች',
    basicAccess: 'መሰረታዊ ተደራሽነት',
    emailSupport: 'የኢሜል ድጋፍ',
    steadyGrowth: 'የተረጋጋ እድገት',
    limitedAccess: 'የተገደበ ተደራሽነት',
    basicSupport: 'መሰረታዊ ድጋፍ',
    entryReturns: 'የመግቢያ ተመላሾች'
  },
  ti: { // Tigrinya
    referralRewards: 'ሪፈረል ሪዋርድ',
    referralDescription: 'ንዝተሓዘዘ ሰብ ምምራት ብር ኣብ ካብ ዚካተት ይገባካ',
    twoReferrals: '2 ሪፈረል',
    threeReferrals: '3 ሪፈረል',
    fourReferrals: '4 ሪፈረል',
    fiveReferrals: '5 ሪፈረል',
    tenReferrals: '10 ሪፈረል',
    earnOnTwo: 'ኣብ 2 ሪፈረል ገንዘብ ኣግና',
    earnOnThree: 'ኣብ 3 ሪፈረል ገንዘብ ኣግና',
    earnOnFour: 'ኣብ 4 ሪፈረል ገንዘብ ኣግና',
    earnOnFive: 'ኣብ 5 ሪፈረል ገንዘብ ኣግና',
    earnOnTen: 'ኣብ 10 ሪፈረል ገንዘብ ኣግና',
    immediateRewards: 'ዘለዎ ብር ሪዋርድ',
    directBonus: 'ቀጥታ ብር',
    betterReturns: 'ዝተሻለ ምርት',
    maximumBonus: 'ከፍተኛ ሽልማት',
    topTier: 'ሪዋርድ ኣብ ላዕለዋ'
  }
};

const packages = [
  {
    id: 1,
    nameKey: 'twoReferrals',
    price: "49 - 2499",
    descriptionKey: 'referralDescription',
    featuresKeys: ['earnOnTwo', 'immediateRewards', 'directBonus', 'betterReturns'],
    icon: Users,
    gradient: 'from-emerald-600 to-emerald-800'
  },
  {
    id: 2,
    nameKey: 'threeReferrals',
    price: "49 - 2499",
    descriptionKey: 'referralDescription',
    featuresKeys: ['earnOnThree', 'immediateRewards', 'directBonus', 'betterReturns'],
    icon: TrendingUp,
    gradient: 'from-green-600 to-green-800'
  },
  {
    id: 3,
    nameKey: 'fourReferrals',
    price: "49 - 2499",
    descriptionKey: 'referralDescription',
    featuresKeys: ['earnOnFour', 'immediateRewards', 'betterReturns', 'maximumBonus'],
    icon: DollarSign,
    gradient: 'from-purple-600 to-purple-800'
  },
  {
    id: 4,
    nameKey: 'fiveReferrals',
    price: "49-2499",
    descriptionKey: 'referralDescription',
    featuresKeys: ['earnOnFive', 'betterReturns', 'maximumBonus', 'topTier'],
    icon: TrendingUp,
    gradient: 'from-orange-600 to-orange-800'
  },
  {
    id: 5,
    nameKey: 'tenReferrals',
    price: "49 - 2499",
    descriptionKey: 'referralDescription',
    featuresKeys: ['earnOnTen', 'betterReturns', 'maximumBonus', 'topTier'],
    icon: Calendar,
    gradient: 'from-red-600 to-red-800'
  }
];

const PackageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [language, setLanguage] = useState('en'); // Default language

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === packages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex(currentIndex === packages.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? packages.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
    setIsAutoPlaying(false); // Reset auto-play on language change
  };

  const t = (key: string) => {
    return translations[language][key] || key; // Fallback to key if translation not found
  };

  return (
    <div className="relative overflow-hidden text-white bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="px-4 py-2 mx-auto sm:py-4 max-w-7xl sm:px-6 lg:px-8">

        {/* Language Dropdown */}
        <div className="absolute z-20 top-2 right-2">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="p-1 text-sm text-white bg-gray-700 rounded-md"
          >
            <option value="en">English</option>
            <option value="om">Oromo</option>
            <option value="am">Amharic</option>
            <option value="ti">Tigrinya</option>
          </select>
        </div>

        <div className="relative h-40 sm:h-56 md:h-auto">
          {/* Slider Content */}
          <div className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {packages.map((pkg, index) => {
              const IconComponent = pkg.icon;
              return (
                <div key={pkg.id} className="flex-shrink-0 w-full h-full">
                  <div className={`bg-gradient-to-r ${pkg.gradient} rounded-lg p-3 sm:p-6 mx-2 h-full flex flex-col justify-between`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-white/20">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{t(pkg.nameKey)}</h3>
                          <p className="text-sm opacity-90">{t(pkg.descriptionKey)}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {pkg.price.toLocaleString()} ETB
                        </div>
                        {/* <div className="text-sm opacity-90">
                          {pkg.monthlyReturn} Monthly Return
                        </div> */}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 md:grid-cols-4">
                      {pkg.featuresKeys.map((featureKey, idx) => (
                        <div key={idx} className="px-2 py-1 text-xs text-center rounded bg-white/10">
                          {t(featureKey)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 z-10 p-2 transition-colors -translate-y-1/2 rounded-full top-1/2 bg-white/20 hover:bg-white/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 z-10 p-2 transition-colors -translate-y-1/2 rounded-full top-1/2 bg-white/20 hover:bg-white/30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {packages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default PackageSlider