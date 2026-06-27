import React from "react";
import { motion } from "motion/react";
import { BookOpen, Download, BookMarked } from "lucide-react";

export default function MagazineTab() {
  const issues = [
    {
      title: "Vol. 1, Issue 4 - Winter 2024",
      description: "Year-end reflections, sports achievements, and the grand winter gala.",
      coverColor: "bg-indigo-600",
      date: "May 2026",
      readLink: "https://online.fliphtml5.com/caravan76/CARAVAN-QUATERLY-MAGAZINE-2026/#p=1"
    },
    {
      title: "Vol. 1, Issue 3 - Autumn 2024",
      description: "Festivals, technology updates, and book reviews by the literature club.",
      coverColor: "bg-amber-600",
      date: "October 2024"
    },
    {
      title: "Vol. 1, Issue 2 - Monsoon 2024",
      description: "Celebrating the rains with creative writing and environmental awareness.",
      coverColor: "bg-emerald-600",
      date: "July 2024"
    },
    {
      title: "Vol. 1, Issue 1 - Spring 2024",
      description: "Our inaugural issue featuring student poetry, art, and science essays.",
      coverColor: "bg-rose-600",
      date: "April 2024"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto py-8 px-4"
    >
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
          <BookMarked className="w-8 h-8 text-slate-900" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-tight mb-4 font-serif uppercase">
          Caravan Quarterly
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          The official student-led magazine of PM Shri KV IIT Powai. 
          Explore the creative voices, achievements, and stories of our scholars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {issues.map((issue, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5 }}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col group shadow-xl"
          >
            <div className={`h-56 ${issue.coverColor} relative p-6 flex flex-col justify-between overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              <div className="absolute -right-6 -top-6 text-white/10 rotate-12">
                <BookOpen className="w-40 h-40" />
              </div>
              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2 py-1 bg-black/30 backdrop-blur text-white text-xs font-bold rounded">
                  {issue.date}
                </span>
              </div>
              <div className="relative z-10 text-white font-serif font-bold text-2xl leading-tight opacity-90 drop-shadow-md">
                CARAVAN<br />QUARTERLY
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-slate-100 mb-2 text-lg leading-tight">{issue.title}</h3>
              <p className="text-slate-400 text-sm mb-4 flex-grow">{issue.description}</p>
              
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-700/50">
                {issue.readLink ? (
                  <a href={issue.readLink} target="_blank" rel="noopener noreferrer" className="flex-grow bg-slate-700 hover:bg-amber-500 hover:text-slate-900 text-slate-200 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" /> Read Issue
                  </a>
                ) : (
                  <button className="flex-grow bg-slate-700 hover:bg-amber-500 hover:text-slate-900 text-slate-200 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" /> Read Issue
                  </button>
                )}
                <button className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors" title="Download PDF">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
