import React from "react";
import { motion } from "motion/react";
import { Users, Award, BookHeart, User, Heart } from "lucide-react";

export default function StaffTab() {
  const staffMembers = [
    {
      name: "Ashish Kumar",
      role: "Librarian & Senior IT Head",
      contribution: "Spearheaded the digital library initiative and cultivated a thriving reading culture among students.",
      avatarColor: "bg-indigo-100 text-indigo-700",
      years: "25+ Years",
      icon: <BookHeart className="w-6 h-6" />,
      image: "/ashish-kumar.jpeg"
    }
  ];

  const editorialTeam = [
    {
      name: "Editorial Member",
      role: "Editor-in-Chief",
      contribution: "Leads the curation and editing of the library magazine.",
      avatarColor: "bg-emerald-100 text-emerald-700",
      years: "1+ Years",
      icon: <BookHeart className="w-5 h-5" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Library Champions
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Honoring the dedicated staff members who have made significant contributions to our library's growth, resources, and reading culture.
          </p>
        </div>
      </div>

      {/* Senior Staff Profile */}
      <div className="flex justify-center">
        {staffMembers.map((staff, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow group flex flex-col md:flex-row gap-8 items-center w-full max-w-4xl"
          >
            <div className={`w-40 h-40 md:w-48 md:h-48 rounded-3xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner ${staff.avatarColor}`}>
              {staff.image ? (
                <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-20 h-20" />
              )}
            </div>
            
            <div className="flex-grow space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {staff.name}
                </h3>
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {staff.role}
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic">
                "{staff.contribution}"
              </p>
              
              <div className="flex items-center justify-center md:justify-start gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className={`p-2 rounded-xl ${staff.avatarColor} bg-opacity-20`}>
                  {staff.icon}
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Dedicated service for {staff.years}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Caravan Editorial Team Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 mt-12 text-center">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-3">
          <BookHeart className="w-6 h-6 text-emerald-500" />
          Caravan Editorial Team
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
          The creative minds behind our library's publications and newsletters.
        </p>
      </div>

      {/* Caravan Editorial Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {editorialTeam.map((staff, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-6 items-start"
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden ${staff.avatarColor}`}>
              <User className="w-10 h-10" />
            </div>
            
            <div className="flex-grow space-y-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {staff.name}
                </h3>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {staff.role}
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                "{staff.contribution}"
              </p>
              
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className={`p-1.5 rounded-lg ${staff.avatarColor} bg-opacity-20`}>
                  {staff.icon}
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Contributing for {staff.years}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800/30 text-center">
        <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">
          Want to contribute?
        </h3>
        <p className="text-indigo-700 dark:text-indigo-300 text-sm max-w-lg mx-auto">
          We welcome suggestions, book donations, and volunteer support from all staff members to continue making our library a beacon of knowledge.
        </p>
      </div>
    </div>
  );
}
