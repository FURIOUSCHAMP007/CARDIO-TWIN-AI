import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Activity, Shield, Sparkles, ArrowRight, CheckCircle2, AlertCircle, 
  HelpCircle, Volume2, User, Flame, TrendingDown, Clock, Info, Apple, 
  Footprints, Stethoscope, ChevronRight, RotateCcw, Award, Check, Phone, 
  Lightbulb, AlertTriangle, MessageSquare, Sliders, Play, Smile, Frown, Meh, Globe
} from "lucide-react";
import { PatientData, PredictionResult } from "../types";
import VoiceAssistant from "./VoiceAssistant";
import { Language, LANGUAGES, translations } from "../i18n";

interface CommonManViewProps {
  initialPatientData?: PatientData;
  predictionResult?: PredictionResult | null;
  onExecuteAnalysis: (data: PatientData) => Promise<void>;
  onSwitchToSpecialistMode: () => void;
  onOpenAiChat: () => void;
  isLoading: boolean;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function CommonManView({
  initialPatientData,
  predictionResult,
  onExecuteAnalysis,
  onSwitchToSpecialistMode,
  onOpenAiChat,
  isLoading,
  language = "en",
  onLanguageChange
}: CommonManViewProps) {
  const t = translations[language] || translations.en;

  // Input form state (with friendly defaults)
  const [age, setAge] = useState<number>(initialPatientData?.age || 45);
  const [sex, setSex] = useState<"male" | "female">(initialPatientData?.sex || "male");
  
  // Unit toggle for height/weight
  const [useImperial, setUseImperial] = useState<boolean>(false);
  const [feet, setFeet] = useState<number>(5);
  const [inches, setInches] = useState<number>(8);
  const [weightLbs, setWeightLbs] = useState<number>(165);

  const [heightCm, setHeightCm] = useState<number>(initialPatientData?.height || 172);
  const [weightKg, setWeightKg] = useState<number>(initialPatientData?.weight || 75);

  // Blood Pressure: either exact or friendly estimate
  const [bpKnown, setBpKnown] = useState<"known" | "normal" | "high" | "unsure">("known");
  const [systolicBP, setSystolicBP] = useState<number>(initialPatientData?.systolicBP || 120);
  const [diastolicBP, setDiastolicBP] = useState<number>(initialPatientData?.diastolicBP || 80);

  // Cholesterol: either exact or friendly estimate
  const [cholKnown, setCholKnown] = useState<"known" | "normal" | "borderline" | "high" | "unsure">("normal");
  const [cholesterol, setCholesterol] = useState<number>(initialPatientData?.cholesterol || 190);

  // Lifestyle habits
  const [smoking, setSmoking] = useState<boolean>(initialPatientData?.smoking || false);
  const [activityLevel, setActivityLevel] = useState<number>(initialPatientData?.physicalActivity ?? 1);
  const [hasDiabetes, setHasDiabetes] = useState<boolean>(initialPatientData?.diabetes || false);
  const [familyHeartTrouble, setFamilyHeartTrouble] = useState<boolean>((initialPatientData?.familyHistoryScore || 0) > 4);
  const [takingBpMeds, setTakingBpMeds] = useState<boolean>(initialPatientData?.hypertensionHistory || false);

  // What-If Simulation in Common Man view
  const [simWalkingGoal, setSimWalkingGoal] = useState<boolean>(false);
  const [simQuitSmoking, setSimQuitSmoking] = useState<boolean>(false);
  const [simHealthyDiet, setSimHealthyDiet] = useState<boolean>(false);
  const [simBPMeds, setSimBPMeds] = useState<boolean>(false);

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<"report" | "action_plan" | "faq_myths" | "doctor_questions">("report");

  // Sync metric/imperial values
  useEffect(() => {
    if (useImperial) {
      const totalInches = (heightCm / 2.54);
      setFeet(Math.floor(totalInches / 12));
      setInches(Math.round(totalInches % 12));
      setWeightLbs(Math.round(weightKg * 2.20462));
    }
  }, [useImperial]);

  const handleImperialHeightChange = (ft: number, inc: number) => {
    setFeet(ft);
    setInches(inc);
    const cm = Math.round((ft * 12 + inc) * 2.54);
    setHeightCm(cm);
  };

  const handleImperialWeightChange = (lbs: number) => {
    setWeightLbs(lbs);
    const kg = Math.round(lbs / 2.20462);
    setWeightKg(kg);
  };

  // Auto calculate BMI
  const heightMeters = (heightCm || 170) / 100;
  const bmi = parseFloat(((weightKg || 70) / (heightMeters * heightMeters)).toFixed(1));
  const getBmiCategory = (b: number) => {
    if (b < 18.5) return { label: "Underweight", color: "text-amber-600 bg-amber-50" };
    if (b < 24.9) return { label: "Healthy Weight", color: "text-emerald-600 bg-emerald-50" };
    if (b < 29.9) return { label: "Slightly Overweight", color: "text-amber-600 bg-amber-50" };
    return { label: "Higher Weight Range", color: "text-rose-600 bg-rose-50" };
  };

  // Submit form for calculation
  const handleCheckMyHeart = async () => {
    let finalSystolic = systolicBP;
    let finalDiastolic = diastolicBP;
    if (bpKnown === "normal") { finalSystolic = 118; finalDiastolic = 76; }
    else if (bpKnown === "high") { finalSystolic = 145; finalDiastolic = 92; }
    else if (bpKnown === "unsure") { finalSystolic = 125; finalDiastolic = 80; }

    let finalChol = cholesterol;
    if (cholKnown === "normal") finalChol = 180;
    else if (cholKnown === "borderline") finalChol = 215;
    else if (cholKnown === "high") finalChol = 250;
    else if (cholKnown === "unsure") finalChol = 195;

    const patientPayload: PatientData = {
      age,
      sex,
      height: heightCm,
      weight: weightKg,
      systolicBP: finalSystolic,
      diastolicBP: finalDiastolic,
      cholesterol: finalChol,
      glucose: hasDiabetes ? 140 : 90,
      restingHR: activityLevel === 2 ? 62 : activityLevel === 1 ? 72 : 82,
      smoking,
      physicalActivity: activityLevel,
      diabetes: hasDiabetes,
      prevHeartDisease: false,
      hypertensionHistory: takingBpMeds,
      familyHistoryScore: familyHeartTrouble ? 7 : 2,
      medicationAdherence: 85
    };

    await onExecuteAnalysis(patientPayload);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Calculated Heart Risk
  const currentRisk = predictionResult?.overallRisk ?? 18;
  
  // Calculate estimated Heart Age
  // Base formula: Chronological age adjusted by risk delta
  const calculateHeartAge = () => {
    let delta = 0;
    if (currentRisk > 50) delta += 10;
    else if (currentRisk > 30) delta += 6;
    else if (currentRisk > 20) delta += 3;
    else if (currentRisk < 10) delta -= 4;

    if (smoking) delta += 5;
    if (systolicBP > 140) delta += 4;
    if (bmi > 30) delta += 3;
    if (activityLevel === 2) delta -= 3;
    if (hasDiabetes) delta += 5;

    return Math.max(18, age + delta);
  };

  const heartAge = calculateHeartAge();
  const heartAgeDifference = heartAge - age;

  // Calculate simulated risk with everyday lifestyle changes
  const calculateSimulatedRisk = () => {
    let risk = currentRisk;
    if (simWalkingGoal) risk = Math.max(3, risk * 0.82);
    if (simQuitSmoking && smoking) risk = Math.max(3, risk * 0.75);
    if (simHealthyDiet) risk = Math.max(3, risk * 0.88);
    if (simBPMeds && systolicBP > 130) risk = Math.max(3, risk * 0.80);
    return Math.round(risk);
  };

  const simulatedRisk = calculateSimulatedRisk();
  const riskReduction = currentRisk - simulatedRisk;

  // Plain English Risk Level Breakdown
  const getRiskDetails = (risk: number) => {
    if (risk < 15) {
      return {
        level: t.riskLow,
        badgeColor: "bg-emerald-500 text-white",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
        bgLight: "bg-emerald-50/70",
        icon: Smile,
        headline: t.riskLowHead,
        description: t.riskLowDesc,
        actionTip: language === "kn" 
          ? "ಹಣ್ಣು, ತರಕಾರಿ ಸೇವನೆ ಮತ್ತು ದೈನಂದಿನ ನಡಿಗೆಯನ್ನು ಮುಂದುವರಿಸಿ." 
          : language === "hi" 
          ? "ताजी सब्जियां, फल खाएं और रोजाना टहलना जारी रखें।" 
          : "Continue eating plenty of vegetables, fruits, and walking daily."
      };
    } else if (risk < 30) {
      return {
        level: t.riskMod,
        badgeColor: "bg-amber-500 text-white",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        bgLight: "bg-amber-50/70",
        icon: Meh,
        headline: t.riskModHead,
        description: t.riskModDesc,
        actionTip: language === "kn" 
          ? "ದಿನಕ್ಕೆ 25-30 ನಿಮಿಷ ನಡೆಯುವುದು ಮತ್ತು ಉಪ್ಪು ಕಡಿಮೆ ಮಾಡುವುದು ಈ ಸ್ಕೋರ್ ಅನ್ನು ಗಣನೀಯವಾಗಿ ತಗ್ಗಿಸುತ್ತದೆ." 
          : language === "hi" 
          ? "रोज 25-30 मिनट टहलने और नमक कम करने से यह स्कोर तेजी से घट सकता है।" 
          : "Walking 25-30 minutes most days and reducing salty foods can lower this score significantly."
      };
    } else {
      return {
        level: t.riskHigh,
        badgeColor: "bg-rose-500 text-white",
        textColor: "text-rose-700",
        borderColor: "border-rose-200",
        bgLight: "bg-rose-50/70",
        icon: Frown,
        headline: t.riskHighHead,
        description: t.riskHighDesc,
        actionTip: language === "kn" 
          ? "ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಕೊಲೆಸ್ಟ್ರಾಲ್ ತಪಾಸಣೆಗೆ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಲು ನಾವು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ." 
          : language === "hi" 
          ? "ब्लड प्रेशर और कोलेस्ट्रॉल की जांच के लिए डॉक्टर से मिलने की सलाह दी जाती है।" 
          : "We recommend scheduling a routine checkup with your family physician to review blood pressure and cholesterol."
      };
    }
  };

  const riskDetails = getRiskDetails(currentRisk);

  // Multi-lingual spoken summary text (English, Kannada, Hindi)
  const getVoiceText = () => {
    if (language === "kn") {
      return `ನಮಸ್ಕಾರ! ಇದು ನಿಮ್ಮ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಹೃದಯ ಆರೋಗ್ಯ ತಪಾಸಣೆ. ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಹೃದಯ ಅಪಾಯದ ಸ್ಕೋರ್ ಶೇಕಡಾ ${currentRisk} ಆಗಿದೆ. ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಜೀವನಶೈಲಿಯ ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಅಂದಾಜು ಹೃದಯದ ವಯಸ್ಸು ${heartAge} ವರ್ಷಗಳು, ಮತ್ತು ನಿಮ್ಮ ನಿಜವಾದ ವಯಸ್ಸು ${age} ವರ್ಷಗಳು. ${riskDetails.headline} ${smoking ? "ಧೂಮಪಾನ ತ್ಯಜಿಸುವುದು ನಿಮ್ಮ ಹೃದಯಕ್ಕೆ ನೀವು ನೀಡಬಹುದಾದ ಅತ್ಯುತ್ತಮ ಕೊಡುಗೆಯಾಗಿದೆ." : ""} ಪ್ರತಿದಿನ 30 ನಿಮಿಷ ನಡೆಯುವುದು ಮತ್ತು ಉಪ್ಪಿನ ಪ್ರಮಾಣ ಕಡಿಮೆ ಮಾಡುವುದು ನಿಮ್ಮ ಹೃದಯದ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ. ನಿಯಮಿತ ತಪಾಸಣೆಗಾಗಿ ದಯವಿಟ್ಟು ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.`;
    }
    if (language === "hi") {
      return `नमस्ते! यह आपकी व्यक्तिगत हृदय स्वास्थ्य रिपोर्ट है। आपका वर्तमान हृदय जोखिम स्कोर ${currentRisk} प्रतिशत है। आपकी वर्तमान आदतों के अनुसार, आपकी अनुमानित हृदय आयु ${heartAge} वर्ष है, जबकि आपकी वास्तविक आयु ${age} वर्ष है। ${riskDetails.headline} ${smoking ? "धूम्रपान छोड़ना आपके दिल के लिए सबसे बड़ा उपहार होगा।" : ""} रोजाना 30 मिनट टहलने और कम नमक खाने से आपका दिल लंबे समय तक सुरक्षित रहेगा। नियमित जांच के लिए कृपया अपने डॉक्टर से परामर्श लें।`;
    }
    return `Hello! Here is your personalized heart health check. Your current cardiovascular risk score is ${currentRisk} percent, which falls into the ${riskDetails.level} category. Based on your current habits, your estimated Heart Age is ${heartAge} years, compared to your actual age of ${age} years. ${riskDetails.headline} Key tips for you: ${smoking ? "Quitting smoking is the single biggest gift you can give your heart." : ""} Walking thirty minutes a day and cutting back on salty foods can reduce your risk significantly. Please consult your family doctor for routine checkups.`;
  };

  const plainEnglishVoiceText = getVoiceText();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Mode Banner & Welcome Header */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-50">
              <Sparkles className="w-3.5 h-3.5" />
              {t.commonManBadge}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t.commonManTitle}
            </h1>
            <p className="text-rose-100 text-sm sm:text-base font-medium leading-relaxed">
              {t.commonManSubtitle}
            </p>
          </div>

          {/* Actions & Language Switcher */}
          <div className="flex flex-col items-stretch md:items-end gap-3">
            {/* Language Selector Bar */}
            {onLanguageChange && (
              <div 
                id="commonman-language-switcher"
                className="inline-flex items-center bg-black/25 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-sm"
              >
                <div className="flex items-center gap-1 pl-2.5 pr-1.5 text-rose-100 text-xs font-bold">
                  <Globe className="w-3.5 h-3.5 text-white" />
                  <span>Language:</span>
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    id={`commonman-lang-${lang.code}`}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      language === lang.code
                        ? "bg-white text-rose-900 shadow-md font-black"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Switch to Doctor / Specialist Mode button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onSwitchToSpecialistMode}
                className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-50 font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-rose-600" />
                <span>{t.switchToDoctor}</span>
              </button>
              <button
                onClick={onOpenAiChat}
                className="px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.askHeartAi}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Form (Simple Heart Check), Right Side Results */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Easy Question Wizard (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Heart className="w-5 h-5 fill-rose-500/20" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">{t.quickCheckTitle}</h3>
                  <p className="text-slate-400 text-xs font-normal">{t.quickCheckSubtitle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {/* Language switcher mini */}
                {onLanguageChange && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => onLanguageChange(lang.code)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                          language === lang.code
                            ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                        title={lang.label}
                      >
                        {lang.nativeLabel}
                      </button>
                    ))}
                  </div>
                )}

                {/* Unit Toggle */}
                <button
                  type="button"
                  onClick={() => setUseImperial(!useImperial)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  {useImperial ? t.unitFtLbs : t.unitCmKg}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              
              {/* Question 1: Age & Sex */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{t.qAge}</span>
                    <span className="text-rose-600 font-extrabold">{age} {t.yearsOld}</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>20</span>
                    <span>50</span>
                    <span>90</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">{t.qSex}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSex("male")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sex === "male" 
                          ? "bg-slate-900 text-white shadow-sm" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {t.male}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSex("female")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sex === "female" 
                          ? "bg-rose-500 text-white shadow-sm" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {t.female}
                    </button>
                  </div>
                </div>
              </div>

              {/* Question 2: Height & Weight */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">{t.qHeightWeight}</label>
                
                {useImperial ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">{t.feet}</span>
                      <select
                        value={feet}
                        onChange={(e) => handleImperialHeightChange(parseInt(e.target.value), inches)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        {[4, 5, 6, 7].map(f => <option key={f} value={f}>{f} ft</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">{t.inches}</span>
                      <select
                        value={inches}
                        onChange={(e) => handleImperialHeightChange(feet, parseInt(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <option key={i} value={i}>{i} in</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">{t.pounds}</span>
                      <input
                        type="number"
                        min="70"
                        max="400"
                        value={weightLbs}
                        onChange={(e) => handleImperialWeightChange(parseInt(e.target.value) || 150)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">{t.height}: {heightCm} cm</span>
                      <input
                        type="range"
                        min="130"
                        max="210"
                        value={heightCm}
                        onChange={(e) => setHeightCm(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">{t.weight}: {weightKg} kg</span>
                      <input
                        type="range"
                        min="40"
                        max="160"
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* BMI indicator */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <span className="font-bold text-slate-600">{t.calculatedBmi}: {bmi}</span>
                  <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${getBmiCategory(bmi).color}`}>
                    {bmi < 18.5 ? t.bmiUnderweight : bmi < 24.9 ? t.bmiHealthy : bmi < 29.9 ? t.bmiOverweight : t.bmiHigher}
                  </span>
                </div>
              </div>

              {/* Question 3: Blood Pressure */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">{t.qBp}</label>
                  <span className="text-[10px] text-slate-400">e.g. 120/80</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => setBpKnown("normal")}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      bpKnown === "normal" 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t.bpNormal}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBpKnown("high")}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      bpKnown === "high" 
                        ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t.bpHigh}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBpKnown("known")}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      bpKnown === "known" 
                        ? "bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t.bpExact}
                  </button>
                </div>

                {bpKnown === "known" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">{t.bpTop}: {systolicBP}</span>
                      <input
                        type="range"
                        min="90"
                        max="200"
                        value={systolicBP}
                        onChange={(e) => setSystolicBP(parseInt(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">{t.bpBottom}: {diastolicBP}</span>
                      <input
                        type="range"
                        min="50"
                        max="130"
                        value={diastolicBP}
                        onChange={(e) => setDiastolicBP(parseInt(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Question 4: Smoking & Exercise */}
              <div className="space-y-3 pt-1">
                <label className="text-xs font-bold text-slate-700 block">{t.qHabits}</label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block">{t.smokeQuestion}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{t.smokeSub}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSmoking(false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !smoking ? "bg-emerald-600 text-white" : "bg-white border text-slate-600"
                        }`}
                      >
                        {t.no}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSmoking(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          smoking ? "bg-rose-600 text-white" : "bg-white border text-slate-600"
                        }`}
                      >
                        {t.yes}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 block">{t.activityQuestion}</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setActivityLevel(0)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left space-y-0.5 cursor-pointer ${
                          activityLevel === 0 ? "bg-amber-50 border-amber-500 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="block text-sm">🛋️</span>
                        <span className="block font-black text-[11px]">{t.actSedentary}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityLevel(1)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left space-y-0.5 cursor-pointer ${
                          activityLevel === 1 ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="block text-sm">🚶</span>
                        <span className="block font-black text-[11px]">{t.actModerate}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityLevel(2)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left space-y-0.5 cursor-pointer ${
                          activityLevel === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="block text-sm">🏃</span>
                        <span className="block font-black text-[11px]">{t.actActive}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 5: Health Background Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 block">{t.qMedical}</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasDiabetes}
                      onChange={(e) => setHasDiabetes(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded accent-rose-600"
                    />
                    <span className="text-xs font-semibold text-slate-700">{t.medDiabetes}</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={familyHeartTrouble}
                      onChange={(e) => setFamilyHeartTrouble(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded accent-rose-600"
                    />
                    <span className="text-xs font-semibold text-slate-700">{t.medFamily}</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={takingBpMeds}
                      onChange={(e) => setTakingBpMeds(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded accent-rose-600"
                    />
                    <span className="text-xs font-semibold text-slate-700">{t.medBp}</span>
                  </label>
                </div>
              </div>

              {/* Main Submit Action */}
              <button
                type="button"
                onClick={handleCheckMyHeart}
                disabled={isLoading}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-sm uppercase tracking-wider shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>{t.btnCalculating}</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 fill-current" />
                    <span>{t.btnCheckHeart}</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* Right Column: Everyday Citizen Report, Heart Age & Action Plan (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("report")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "report" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.tabHeartScore}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("action_plan")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "action_plan" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.tabActionPlan}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("doctor_questions")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "doctor_questions" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.tabDoctorQuestions}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("faq_myths")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "faq_myths" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.tabFaqMyths}</span>
            </button>
          </div>

          {/* TAB 1: Heart Score & Heart Age */}
          {activeSubTab === "report" && (
            <div className="space-y-6">
              
              {/* Primary Score & Traffic Light Card */}
              <div className={`p-6 sm:p-8 rounded-3xl border ${riskDetails.borderColor} ${riskDetails.bgLight} space-y-6 shadow-sm`}>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${riskDetails.badgeColor}`}>
                      {riskDetails.level}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                      {riskDetails.headline}
                    </h2>
                  </div>

                  <div className="text-right sm:text-right bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.tenYearRisk}</span>
                    <span className="text-3xl font-black text-slate-900">{currentRisk}%</span>
                  </div>
                </div>

                {/* Visual Traffic Light Bar */}
                <div className="space-y-1.5">
                  <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex relative">
                    <div className="w-[20%] bg-emerald-400 h-full" title="Low Risk Zone (0-20%)" />
                    <div className="w-[30%] bg-amber-400 h-full" title="Moderate Risk Zone (20-50%)" />
                    <div className="w-[50%] bg-rose-500 h-full" title="Elevated Risk Zone (50-100%)" />

                    {/* Indicator pin */}
                    <div 
                      className="absolute top-0 bottom-0 w-3 bg-slate-900 rounded-full border-2 border-white shadow-md transform -translate-x-1.5 transition-all duration-500"
                      style={{ left: `${Math.min(98, Math.max(2, currentRisk))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span className="text-emerald-700">🟢 {t.riskLow}</span>
                    <span className="text-amber-700">🟡 {t.riskMod}</span>
                    <span className="text-rose-700">🔴 {t.riskHigh}</span>
                  </div>
                </div>

                <p className="text-slate-700 text-sm font-medium leading-relaxed">
                  {riskDetails.description}
                </p>
              </div>

              {/* Heart Age Comparison Block */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{t.heartAgeTitle}</h3>
                    <p className="text-slate-400 text-xs font-normal">{t.heartAgeSubtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1 text-center sm:text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.yourActualAge}</span>
                    <p className="text-3xl font-black text-slate-800">{age} <span className="text-sm font-bold text-slate-500">{t.yearsOld}</span></p>
                  </div>

                  <div className={`p-4 rounded-2xl space-y-1 text-center sm:text-left border ${
                    heartAgeDifference > 0 ? "bg-rose-50 border-rose-100 text-rose-900" : "bg-emerald-50 border-emerald-100 text-emerald-900"
                  }`}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">{t.estimatedHeartAge}</span>
                    <p className="text-3xl font-black">
                      {heartAge} <span className="text-sm font-bold opacity-80">{t.yearsOld}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {heartAgeDifference > 0 ? (
                    <span>{t.heartAgeOlderMsg.replace("{diff}", String(heartAgeDifference))}</span>
                  ) : (
                    <span>{t.heartAgeYoungerMsg}</span>
                  )}
                </div>
              </div>

              {/* Interactive "What Happens If I Change..." Simulation for Everyday Citizens */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{t.simTitle}</h3>
                      <p className="text-slate-400 text-xs font-normal">{t.simSubtitle}</p>
                    </div>
                  </div>

                  {riskReduction > 0 && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                      -{riskReduction}% {t.potentialDrop}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <label className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    simWalkingGoal ? "bg-teal-50/80 border-teal-300 text-teal-900" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={simWalkingGoal}
                        onChange={(e) => setSimWalkingGoal(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded accent-teal-600"
                      />
                      <div>
                        <span className="text-xs font-extrabold block">{t.simWalk}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{t.simWalkSub}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-700">-18%</span>
                  </label>

                  {smoking && (
                    <label className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      simQuitSmoking ? "bg-emerald-50/80 border-emerald-300 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={simQuitSmoking}
                          onChange={(e) => setSimQuitSmoking(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded accent-emerald-600"
                        />
                        <div>
                          <span className="text-xs font-extrabold block">{t.simQuitSmoke}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{t.simQuitSmokeSub}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">-25%</span>
                    </label>
                  )}

                  <label className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    simHealthyDiet ? "bg-indigo-50/80 border-indigo-300 text-indigo-900" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={simHealthyDiet}
                        onChange={(e) => setSimHealthyDiet(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-extrabold block">{t.simDiet}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{t.simDietSub}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-700">-12%</span>
                  </label>
                </div>

                {/* Projected Result */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.projectedRisk}</span>
                    <span className="text-2xl font-black text-emerald-400">{simulatedRisk}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.lifeBenefit}</span>
                    <span className="text-xs font-bold text-slate-200">
                      {riskReduction > 0 ? t.bringsAgeDown.replace("{age}", String(Math.max(18, heartAge - 4))) : (language === "kn" ? "ಮೇಲಿನ ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಿ" : language === "hi" ? "ऊपर दिए गए विकल्प चुनें" : "Toggle options above")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spoken Narration for Common Man */}
              <VoiceAssistant
                title={t.voiceTitle}
                subtitle={t.voiceSubtitle}
                textToSpeak={plainEnglishVoiceText}
                language={language}
              />

            </div>
          )}

          {/* TAB 2: 3-Step Everyday Heart Action Plan */}
          {activeSubTab === "action_plan" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-900 text-lg">{t.actionPlanTitle}</h3>
                  <p className="text-slate-500 text-xs font-normal">{t.actionPlanSubtitle}</p>
                </div>

                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500 text-white rounded-xl text-xs font-black">1</div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{t.step1Title}</h4>
                    </div>
                    <p className="text-slate-600 text-xs font-normal leading-relaxed pl-9">
                      {t.step1Desc}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-600 text-white rounded-xl text-xs font-black">2</div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{t.step2Title}</h4>
                    </div>
                    <p className="text-slate-600 text-xs font-normal leading-relaxed pl-9">
                      {t.step2Desc}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl text-xs font-black">3</div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{t.step3Title}</h4>
                    </div>
                    <p className="text-slate-600 text-xs font-normal leading-relaxed pl-9">
                      {t.step3Desc}
                    </p>
                  </div>
                </div>

                {/* Emergency Red Flags Box */}
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    {t.emergencyAlertTitle}
                  </div>
                  <p className="text-slate-700 text-xs font-normal leading-relaxed">
                    {t.emergencyAlertDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Questions to Ask Your Doctor */}
          {activeSubTab === "doctor_questions" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">{t.docQuestionsTitle}</h3>
                <p className="text-slate-500 text-xs font-normal">{t.docQuestionsSubtitle}</p>
              </div>

              <div className="space-y-3">
                {[
                  t.docQ1,
                  t.docQ2,
                  t.docQ3,
                  t.docQ4,
                  t.docQ5
                ].map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                    <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black flex-shrink-0 mt-0.5">
                      Q{idx + 1}
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Heart Myths & FAQs */}
          {activeSubTab === "faq_myths" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">{t.mythsTitle}</h3>
                <p className="text-slate-500 text-xs font-normal">{t.mythsSubtitle}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded">
                      {language === "kn" ? "ತಪ್ಪು ಕಲ್ಪನೆ" : language === "hi" ? "भ्रम" : "Myth"}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800">{t.myth1}</h4>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed pl-1">
                    <strong>{language === "kn" ? "ವಾಸ್ತವ:" : language === "hi" ? "सच्चाई:" : "Fact:"}</strong> {t.fact1}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded">
                      {language === "kn" ? "ತಪ್ಪು ಕಲ್ಪನೆ" : language === "hi" ? "भ्रम" : "Myth"}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800">{t.myth2}</h4>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed pl-1">
                    <strong>{language === "kn" ? "ವಾಸ್ತವ:" : language === "hi" ? "सच्चाई:" : "Fact:"}</strong> {t.fact2}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded">
                      {language === "kn" ? "ತಪ್ಪು ಕಲ್ಪನೆ" : language === "hi" ? "भ्रम" : "Myth"}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800">{t.myth3}</h4>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed pl-1">
                    <strong>{language === "kn" ? "ವಾಸ್ತವ:" : language === "hi" ? "सच्चाई:" : "Fact:"}</strong> {t.fact3}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
