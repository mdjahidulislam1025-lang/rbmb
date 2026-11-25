import * as React from 'react';
import { Printer, X, Receipt } from 'lucide-react';
import { useApp } from '../App';
import { FeeRecord } from '../types';

interface FeeReceiptModalProps {
  fee: FeeRecord | null;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({ fee, onClose }) => {
  const { lang, t, settings } = useApp();

  if (!fee) return null;

  const balanceDue = Math.max(0, fee.amount - fee.paidAmount);
  const receiptCode = fee.receiptNo || `RBMB-${fee.id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm no-print" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              {lang === 'bn' ? 'অফিসিয়াল ফি রশিদ' : 'Official Fee Receipt'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'প্রিন্ট / PDF' : 'Print Receipt'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div id="printable-fee-receipt" className="p-6 sm:p-8 print:p-2 space-y-6 bg-white dark:bg-slate-900 print:bg-white text-slate-900 dark:text-slate-100 print:text-slate-900">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              {settings.shortName || 'রাণীর বাজার মাধ্যমিক বিদ্যালয়'}
            </p>
            <h2 className="text-xl font-black">{t(settings.name)}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {t(settings.location)} · EIIN: {settings.eiin}
            </p>
            <div className="pt-2">
              <span className="inline-block border border-slate-900 dark:border-slate-600 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-widest">
                {lang === 'bn' ? 'বেতন ও ফি প্রদানের রশিদ' : 'STUDENT FEE VOUCHER / RECEIPT'}
              </span>
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'রশিদ নম্বর' : 'Receipt No'}</p>
              <p className="font-extrabold font-mono-code tabular-nums mt-0.5">{receiptCode}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'অবস্থা' : 'Payment Status'}</p>
              <p className="font-extrabold uppercase mt-0.5">{fee.status}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name'}</p>
              <p className="font-bold mt-0.5">{fee.studentName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'শ্রেণী ও রোল' : 'Class & Roll'}</p>
              <p className="font-bold tabular-nums mt-0.5">
                Class {fee.classId} · Roll #{fee.roll}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'মাধ্যম' : 'Payment Method'}</p>
              <p className="font-bold mt-0.5">{fee.paymentMethod || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{lang === 'bn' ? 'তারিখ' : 'Paid / Due Date'}</p>
              <p className="font-bold tabular-nums mt-0.5">{fee.paidDate || fee.dueDate}</p>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs sm:text-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">{lang === 'bn' ? 'বিবরণ' : 'Fee Particular'}</th>
                  <th className="px-4 py-3">{lang === 'bn' ? 'খাত' : 'Category'}</th>
                  <th className="px-4 py-3 text-right tabular-nums">{lang === 'bn' ? 'টাকা (BDT)' : 'Amount (BDT)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3 font-bold">
                    {fee.title}
                    {fee.billingMonth && <span className="block text-xs text-slate-400 font-normal">{fee.billingMonth}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs">{fee.category}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">৳{fee.amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-4 py-2.5 text-right font-semibold text-slate-500">
                    {lang === 'bn' ? 'পরিশোধিত টাকা' : 'Amount Paid'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    ৳{fee.paidAmount.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800/50 font-extrabold">
                  <td colSpan={2} className="px-4 py-3 text-right">
                    {lang === 'bn' ? 'বকেয়া পরিমাণ' : 'Balance Due'}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ৳{fee.status === 'waived' ? 0 : balanceDue.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'আদায়কারী:' : 'Recorded by:'} <b className="text-slate-800 dark:text-slate-200">{fee.recordedBy}</b>
            </span>
            <span className="border-t border-slate-400 dark:border-slate-600 px-4 pt-1 font-bold">
              {lang === 'bn' ? 'হিসাব শাখার স্বাক্ষর' : 'Accounts Office'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
