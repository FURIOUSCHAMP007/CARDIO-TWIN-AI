import React from "react";
import { Printer, FileDown, ShieldCheck, HelpCircle } from "lucide-react";
import { PatientData } from "../types";

interface ClinicalReportExportProps {
  patientData: PatientData;
  overallRisk: number;
  bestModelName: string;
  summaryText: string;
}

export default function ClinicalReportExport({ patientData, overallRisk, bestModelName, summaryText }: ClinicalReportExportProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-400 block">Consult Documentation</span>
            <h3 className="font-extrabold text-white text-lg">Official Medical Report Compiler</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full self-start">
          <ShieldCheck className="w-4 h-4" />
          <span>Decision Support Certified</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <p className="text-slate-300 text-xs leading-relaxed font-normal">
            Compile all model parameters, SHAP explanations, counterfactual simulations, and the clinical report summary into a professionally-formatted, print-ready document.
          </p>
          <div className="flex items-start gap-1.5 text-[10px] text-slate-400 font-normal">
            <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" />
            <span>Clicking the Print button triggers the system print manager. Choose "Save as PDF" to generate a physical document instantly.</span>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Clinical Dossier</span>
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4" />
            <span>Save PDF Document</span>
          </button>
        </div>
      </div>

      {/* Structured Print Layout Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: #000000 !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
