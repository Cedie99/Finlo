"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calculator, X, Delete, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────
type Mode = "basic" | "loan" | "installment";
type Op = "+" | "-" | "×" | "÷" | null;

// ── Finance helpers ────────────────────────────────────────────
function calcLoan(principal: number, annualRate: number, months: number) {
  if (months <= 0 || principal <= 0) return null;
  if (annualRate === 0) {
    const monthly = principal / months;
    return { monthly, total: principal, interest: 0 };
  }
  const r = annualRate / 100 / 12;
  const pow = Math.pow(1 + r, months);
  const monthly = (principal * r * pow) / (pow - 1);
  const total = monthly * months;
  return { monthly, total, interest: total - principal };
}

function calcInstallment(price: number, down: number, months: number, annualRate: number) {
  const principal = Math.max(0, price - down);
  const loan = calcLoan(principal, annualRate, months);
  if (!loan) return null;
  return { monthly: loan.monthly, totalCost: down + loan.total, interest: loan.interest };
}

function fmtPHP(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ── Basic calculator state ─────────────────────────────────────
interface BasicState {
  display: string;
  expression: string;
  operator: Op;
  prev: number | null;
  waitNext: boolean;
  evaluated: boolean;
}

const initBasic: BasicState = {
  display: "0",
  expression: "",
  operator: null,
  prev: null,
  waitNext: false,
  evaluated: false,
};

function applyOp(a: number, b: number, op: Op): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
    default:  return b;
  }
}

function formatDisplay(val: string): string {
  if (val === "NaN" || val === "Infinity") return "Error";
  if (val.endsWith(".")) return val;
  const n = parseFloat(val);
  if (isNaN(n) || !isFinite(n)) return "Error";
  if (val.includes(".")) {
    const [int, dec] = val.split(".");
    return Number(int).toLocaleString("en-PH") + "." + dec;
  }
  return n.toLocaleString("en-PH", { maximumFractionDigits: 10 });
}

// ── Shared sub-components ──────────────────────────────────────
function NumInput({
  label, value, onChange, prefix, suffix, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wide font-semibold text-white/40 mb-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-sm text-white/40 font-medium select-none">{prefix}</span>}
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className={cn(
            "w-full rounded-xl border border-white/7 bg-[#0a0a0f] py-2 text-sm font-semibold text-white placeholder:text-white/25",
            "outline-none focus:border-[#b4f03a] focus:ring-2 focus:ring-[#b4f03a]/20 transition",
            prefix ? "pl-7 pr-3" : suffix ? "pl-3 pr-8" : "px-3"
          )}
        />
        {suffix && <span className="absolute right-3 text-sm text-white/40 font-medium select-none">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl px-3 py-2 border", accent ? "bg-[#b4f03a]/10 border-[#b4f03a]/30" : "bg-white/5 border-white/7")}>
      <p className="text-[10px] uppercase tracking-wide text-white/40 mb-0.5">{label}</p>
      <p className={cn("text-sm font-bold", accent ? "text-[#b4f03a]" : "text-white")}>{value}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export function FinanceCalculator() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("basic");

  // Basic calc
  const [basic, setBasic] = useState<BasicState>(initBasic);

  // Loan
  const [lPrincipal, setLPrincipal] = useState("");
  const [lRate, setLRate]           = useState("");
  const [lMonths, setLMonths]       = useState("");

  // Installment
  const [iPrice, setIPrice]   = useState("");
  const [iDown, setIDown]     = useState("");
  const [iMonths, setIMonths] = useState("");
  const [iRate, setIRate]     = useState("");

  useEffect(() => { setMounted(true); }, []);

  // ── Basic calc handlers ──
  const pressDigit = useCallback((d: string) => {
    setBasic((s) => {
      if (s.waitNext || s.evaluated)
        return { ...s, display: d, waitNext: false, evaluated: false };
      return { ...s, display: s.display === "0" ? d : s.display + d };
    });
  }, []);

  const pressDot = useCallback(() => {
    setBasic((s) => {
      if (s.waitNext || s.evaluated)
        return { ...s, display: "0.", waitNext: false, evaluated: false };
      if (s.display.includes(".")) return s;
      return { ...s, display: s.display + "." };
    });
  }, []);

  const pressOp = useCallback((op: Op) => {
    setBasic((s) => {
      const cur = parseFloat(s.display);
      if (s.prev !== null && !s.waitNext) {
        const result = applyOp(s.prev, cur, s.operator);
        return { display: String(result), expression: `${result} ${op}`, operator: op, prev: result, waitNext: true, evaluated: false };
      }
      return { ...s, expression: `${s.display} ${op}`, operator: op, prev: cur, waitNext: true, evaluated: false };
    });
  }, []);

  const pressEquals = useCallback(() => {
    setBasic((s) => {
      if (s.prev === null || s.operator === null) return { ...s, evaluated: true };
      const cur = parseFloat(s.display);
      const result = applyOp(s.prev, cur, s.operator);
      const str = isFinite(result) ? String(result) : "NaN";
      return { display: str, expression: `${s.expression} ${s.display} =`, operator: null, prev: null, waitNext: false, evaluated: true };
    });
  }, []);

  const pressPercent = useCallback(() => {
    setBasic((s) => ({ ...s, display: String(parseFloat(s.display) / 100) }));
  }, []);

  const pressSign = useCallback(() => {
    setBasic((s) => ({ ...s, display: String(parseFloat(s.display) * -1) }));
  }, []);

  const pressBack = useCallback(() => {
    setBasic((s) => {
      if (s.evaluated || s.waitNext) return s;
      return { ...s, display: s.display.length > 1 ? s.display.slice(0, -1) : "0" };
    });
  }, []);

  const pressClear = useCallback(() => setBasic(initBasic), []);

  // Keyboard handler for basic mode
  useEffect(() => {
    if (!open || mode !== "basic") return;
    const h = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9")  { pressDigit(e.key); return; }
      if (e.key === ".")                  { pressDot(); return; }
      if (e.key === "+")                  { pressOp("+"); return; }
      if (e.key === "-")                  { pressOp("-"); return; }
      if (e.key === "*")                  { pressOp("×"); return; }
      if (e.key === "/")                  { e.preventDefault(); pressOp("÷"); return; }
      if (e.key === "Enter" || e.key === "=") { pressEquals(); return; }
      if (e.key === "Backspace")          { pressBack(); return; }
      if (e.key === "Escape")             { setOpen(false); return; }
      if (e.key.toLowerCase() === "c")    { pressClear(); return; }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, mode, pressDigit, pressDot, pressOp, pressEquals, pressBack, pressClear]);

  // ── Finance results ──
  const loanResult = (() => {
    const p = parseFloat(lPrincipal), r = parseFloat(lRate), m = parseFloat(lMonths);
    if (!p || !m) return null;
    return calcLoan(p, isNaN(r) ? 0 : r, m);
  })();

  const instResult = (() => {
    const price = parseFloat(iPrice), down = parseFloat(iDown) || 0;
    const months = parseFloat(iMonths), rate = parseFloat(iRate) || 0;
    if (!price || !months) return null;
    return calcInstallment(price, down, months, rate);
  })();

  // ── Button layout ──
  type BtnDef = { label: string; action: () => void; style?: string; wide?: boolean; isOp?: boolean };
  const btnRows: BtnDef[][] = [
    [
      { label: "C",  action: pressClear,        style: "bg-white/10 text-white/70 hover:bg-white/20 font-semibold" },
      { label: "±",  action: pressSign,         style: "bg-white/10 text-white/70 hover:bg-white/20 font-semibold" },
      { label: "%",  action: pressPercent,      style: "bg-white/10 text-white/70 hover:bg-white/20 font-semibold" },
      { label: "÷",  action: () => pressOp("÷"), style: "bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52]", isOp: true },
    ],
    [
      { label: "7", action: () => pressDigit("7") },
      { label: "8", action: () => pressDigit("8") },
      { label: "9", action: () => pressDigit("9") },
      { label: "×", action: () => pressOp("×"), style: "bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52]", isOp: true },
    ],
    [
      { label: "4", action: () => pressDigit("4") },
      { label: "5", action: () => pressDigit("5") },
      { label: "6", action: () => pressDigit("6") },
      { label: "-", action: () => pressOp("-"), style: "bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52]", isOp: true },
    ],
    [
      { label: "1", action: () => pressDigit("1") },
      { label: "2", action: () => pressDigit("2") },
      { label: "3", action: () => pressDigit("3") },
      { label: "+", action: () => pressOp("+"), style: "bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52]", isOp: true },
    ],
    [
      { label: "0", action: () => pressDigit("0"), wide: true },
      { label: ".", action: pressDot },
      { label: "=", action: pressEquals, style: "bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52]", isOp: true },
    ],
  ];

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Floating trigger — top-right corner */}
      <button
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "fixed top-20 right-5 z-30",
          "flex items-center justify-center w-11 h-11 rounded-xl shadow-[0_8px_20px_rgba(180,240,58,0.25)]",
          "transition-all active:scale-95",
          open
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/7"
            : "bg-[#b4f03a] hover:bg-[#ccff52] text-[#0c0c10]"
        )}
        title="Finance Calculator"
        type="button"
      >
        {open ? <X size={18} /> : <Calculator size={18} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed top-24 right-5 z-30 w-80 rounded-2xl border border-white/7 bg-[#111118] shadow-[0_24px_60px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-white/7">
            <Calculator size={14} className="text-[#b4f03a]" />
            <span className="text-sm font-bold text-white flex-1">Finance Calculator</span>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 p-2 bg-white/5">
            {(["basic", "loan", "installment"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold transition-colors capitalize rounded-lg",
                  mode === m
                    ? "bg-[#b4f03a] text-[#0c0c10]"
                    : "text-white/40 hover:text-white/60"
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* ── Basic ── */}
          {mode === "basic" && (
            <div className="p-4">
              {/* Display */}
              <div className="rounded-xl bg-white/5 border border-white/7 px-4 py-2.5 mb-2 text-right min-h-[56px] flex flex-col justify-between">
                <p className="text-[10px] text-white/40 truncate min-h-[13px]">
                  {basic.expression || "\u00A0"}
                </p>
                <p className="text-xl font-black text-white truncate leading-tight">
                  {formatDisplay(basic.display)}
                </p>
              </div>

              {/* Backspace */}
              <div className="flex justify-end mb-2">
                <button onClick={pressBack} className="p-1.5 rounded-lg text-white/40 hover:bg-white/10 transition">
                  <Delete size={13} />
                </button>
              </div>

              {/* Buttons */}
              <div className="space-y-1">
                {btnRows.map((row, ri) => (
                  <div key={ri} className="flex gap-1">
                    {row.map((btn) => (
                      <button
                        key={btn.label}
                        onClick={btn.action}
                        className={cn(
                          "rounded-lg py-2 text-sm font-bold transition-all active:scale-95",
                          btn.wide ? "flex-[2]" : "flex-1",
                          btn.style ?? "bg-white/5 border border-white/7 text-white hover:bg-white/10",
                          btn.isOp && basic.operator === btn.label && !basic.evaluated
                            ? "ring-2 ring-offset-1 ring-offset-[#111118] ring-[#b4f03a]"
                            : ""
                        )}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Loan ── */}
          {mode === "loan" && (
            <div className="p-4 space-y-3">
              <p className="text-xs text-white/40">Monthly payment for any loan.</p>
              <NumInput label="Principal Amount" value={lPrincipal} onChange={setLPrincipal} prefix="₱" />
              <div className="grid grid-cols-2 gap-2">
                <NumInput label="Annual Rate" value={lRate} onChange={setLRate} suffix="%" placeholder="0" />
                <NumInput label="Months" value={lMonths} onChange={setLMonths} placeholder="12" />
              </div>

              {loanResult ? (
                <div className="space-y-1.5 pt-1">
                  <ResultRow label="Monthly Payment" value={fmtPHP(loanResult.monthly)} accent />
                  <div className="grid grid-cols-2 gap-1.5">
                    <ResultRow label="Total Payment" value={fmtPHP(loanResult.total)} />
                    <ResultRow label="Total Interest" value={fmtPHP(loanResult.interest)} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white/5 border border-white/7 px-3 py-3 text-center">
                  <p className="text-xs text-white/40">Fill in the fields above.</p>
                </div>
              )}

              <button
                onClick={() => { setLPrincipal(""); setLRate(""); setLMonths(""); }}
                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/60 transition"
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>
          )}

          {/* ── Installment ── */}
          {mode === "installment" && (
            <div className="p-4 space-y-3">
              <p className="text-xs text-white/40">Break a purchase into monthly payments.</p>
              <NumInput label="Item Price" value={iPrice} onChange={setIPrice} prefix="₱" />
              <NumInput label="Down Payment" value={iDown} onChange={setIDown} prefix="₱" placeholder="0" />
              <div className="grid grid-cols-2 gap-2">
                <NumInput label="Months" value={iMonths} onChange={setIMonths} placeholder="12" />
                <NumInput label="Annual Rate" value={iRate} onChange={setIRate} suffix="%" placeholder="0" />
              </div>

              {instResult ? (
                <div className="space-y-1.5 pt-1">
                  <ResultRow label="Monthly Payment" value={fmtPHP(instResult.monthly)} accent />
                  <div className="grid grid-cols-2 gap-1.5">
                    <ResultRow label="Total Cost" value={fmtPHP(instResult.totalCost)} />
                    <ResultRow label="Total Interest" value={fmtPHP(instResult.interest)} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white/5 border border-white/7 px-3 py-3 text-center">
                  <p className="text-xs text-white/40">Fill in the fields above.</p>
                </div>
              )}

              <button
                onClick={() => { setIPrice(""); setIDown(""); setIMonths(""); setIRate(""); }}
                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/60 transition"
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>
          )}
        </div>
      )}
    </>,
    document.body
  );
}
