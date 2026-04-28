import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {items.map((item, i) => (
        <div
          key={i}
          className={`border rounded-xl transition-all ${
            openIndex === i ? "border-[#00FF66]/50 bg-[#1A1A1A]" : "border-[#2A2A2A] bg-[#111]"
          }`}
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex justify-between items-center px-6 py-5 text-left"
          >
            <span className={`font-semibold text-lg ${openIndex === i ? "text-[#00FF66]" : "text-white"}`}>
              {item.question}
            </span>
            <span
              className={`text-2xl transition-transform duration-300 ${
                openIndex === i ? "rotate-45 text-[#00FF66]" : "text-[#888]"
              }`}
            >
              +
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="px-6 pb-5 text-[#888] leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}