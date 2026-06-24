import React from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  ExternalLink, 
  Globe, 
  GraduationCap, 
  Library, 
  School,
  FileText,
  Video,
  Database
} from "lucide-react";

export default function MenuTab() {
  const linkCategories = [
    {
      title: "Educational Frameworks",
      links: [
        { title: "NEP 2020 Complete Document", icon: <FileText className="w-5 h-5" />, url: "https://www.education.gov.in/sites/upload_files/mhrd/files/NEP_Final_English_0.pdf" },
        { title: "National Curriculum Framework (NCF)", icon: <GraduationCap className="w-5 h-5" />, url: "https://ncert.nic.in/pdf/NCF2023.pdf" }
      ]
    },
    {
      title: "KV & PM Shri Portals",
      links: [
        { title: "Kendriya Vidyalaya Sangathan HQ", icon: <School className="w-5 h-5" />, url: "https://kvsangathan.nic.in/" },
        { title: "KVS Regional Office Mumbai", icon: <School className="w-5 h-5" />, url: "https://romumbai.kvs.gov.in/" },
        { title: "PM Shri Schools Official Portal", icon: <Globe className="w-5 h-5" />, url: "https://pmshrischools.education.gov.in/" },
        { title: "KV IIT Powai Website", icon: <Library className="w-5 h-5" />, url: "https://iitpowai.kvs.ac.in/" }
      ]
    },
    {
      title: "Digital Libraries & E-Resources",
      links: [
        { title: "National Digital Library of India (NDLI)", icon: <Database className="w-5 h-5" />, url: "https://ndl.iitkgp.ac.in/" },
        { title: "DIKSHA E-Learning Platform", icon: <Video className="w-5 h-5" />, url: "https://diksha.gov.in/" },
        { title: "NCERT Official Textbooks", icon: <BookOpen className="w-5 h-5" />, url: "https://ncert.nic.in/textbook.php" }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto py-8 px-4"
    >
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-slate-700 shadow-xl">
          <School className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Important Links</h2>
        <p className="text-slate-400 text-sm">
          Quick access to essential educational resources and portals.
        </p>
      </div>

      <div className="space-y-8">
        {linkCategories.map((category, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest px-2">
              {category.title}
            </h3>
            <div className="space-y-2">
              {category.links.map((link, linkIdx) => (
                <a
                  key={linkIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-xl transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mr-4 border border-slate-700">
                    {link.icon}
                  </div>
                  <span className="font-medium text-slate-200 group-hover:text-amber-400 transition-colors flex-grow">
                    {link.title}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
