import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Award, BookHeart, User, Heart, Star, BookOpen, Folder, ArrowLeft, ChevronRight } from "lucide-react";

export default function ReadersClubTab() {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const committeeMembers = [
    {
      name: "Rohan Patel",
      role: "President",
      contribution: "Organized the inter-school reading competition and established the weekly peer-reading sessions.",
      avatarColor: "bg-blue-100 text-blue-700",
      grade: "Class X-A",
      icon: <Award className="w-5 h-5" />
    },
    {
      name: "Sneha Iyer",
      role: "Secretary",
      contribution: "Maintained the reading logs for junior classes and managed the library book review board.",
      avatarColor: "bg-pink-100 text-pink-700",
      grade: "Class IX-B",
      icon: <BookHeart className="w-5 h-5" />
    },
    {
      name: "Aryan Khan",
      role: "Event Coordinator",
      contribution: "Hosted author interactions and the annual library festival with tremendous success.",
      avatarColor: "bg-purple-100 text-purple-700",
      grade: "Class X-C",
      icon: <Users className="w-5 h-5" />
    },
    {
      name: "Diya Sharma",
      role: "Creative Head",
      contribution: "Designed all posters and visual themes for library events and the student magazine.",
      avatarColor: "bg-orange-100 text-orange-700",
      grade: "Class XI-Sci",
      icon: <Star className="w-5 h-5" />
    }
  ];

  const class6Students = [
    { name: "Bandi Madhava", role: "Member", contribution: "Active participant in weekly book discussions.", avatarColor: "bg-indigo-100 text-indigo-700", grade: "Class VI B", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Aarav Shukla", role: "Member", contribution: "Shared insightful reviews on adventure novels.", avatarColor: "bg-teal-100 text-teal-700", grade: "Class VI B", icon: <Star className="w-5 h-5" /> },
    { name: "Mayank Kaudare", role: "Member", contribution: "Top reader of the month for science fiction.", avatarColor: "bg-blue-100 text-blue-700", grade: "Class VI B", icon: <Award className="w-5 h-5" /> },
    { name: "Saachi Sharma", role: "Member", contribution: "Led the junior reading circle during library periods.", avatarColor: "bg-rose-100 text-rose-700", grade: "Class VI B", icon: <Heart className="w-5 h-5" /> },
    { name: "Adrija Roy", role: "Member", contribution: "Contributed amazing book recommendations.", avatarColor: "bg-amber-100 text-amber-700", grade: "Class VI B", icon: <BookHeart className="w-5 h-5" /> },
    { name: "Supriya Singh", role: "Member", contribution: "Helped organize the class library corner.", avatarColor: "bg-emerald-100 text-emerald-700", grade: "Class VI B", icon: <Users className="w-5 h-5" /> },
    { name: "Drashti Dave", role: "Member", contribution: "Avid reader and frequent book reviewer.", avatarColor: "bg-purple-100 text-purple-700", grade: "Class VI B", icon: <BookOpen className="w-5 h-5" /> },
  ];

  const folders = [
    { id: "committee", name: "Core Committee", count: committeeMembers.length, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/50" },
    { id: "class6", name: "Class 6th", count: class6Students.length, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50" }
  ];

  const renderStudentCards = (students: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {students.map((member, idx) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-6 items-start"
        >
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden ${member.avatarColor}`}>
            {member.image ? (
              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10" />
            )}
          </div>
          
          <div className="flex-grow space-y-3">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {member.name}
              </h3>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {member.role}
              </p>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              "{member.contribution}"
            </p>
            
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className={`p-1.5 rounded-lg ${member.avatarColor} bg-opacity-20`}>
                {member.icon}
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {member.grade}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Reader's Club
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Celebrating the passionate students who lead reading initiatives, foster literary discussions, and contribute to our vibrant library community.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!activeFolder ? (
          <motion.div
            key="folders"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {folders.map((folder, idx) => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group"
              >
                <div className={`p-4 rounded-2xl ${folder.color} group-hover:scale-110 transition-transform`}>
                  <Folder className="w-8 h-8" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {folder.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {folder.count} Members
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="folder-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveFolder(null)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-500" />
                  {folders.find(f => f.id === activeFolder)?.name}
                </h3>
              </div>
            </div>
            
            {activeFolder === "committee" && renderStudentCards(committeeMembers)}
            {activeFolder === "class6" && renderStudentCards(class6Students)}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-800/30 text-center mt-12">
        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
          Join the Reader's Club
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm max-w-lg mx-auto">
          Become a part of our literary journey. Connect with fellow book lovers, organize events, and shape the future of our library.
        </p>
      </div>
    </div>
  );
}
