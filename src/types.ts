export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  category: "Activity" | "Notice" | "PM-Shri" | "Competition";
  content: string;
  badge?: string;
  priority: "High" | "Normal";
  imageUrl?: string;
}

export interface LibraryStat {
  label: string;
  value: string;
  iconName: string;
  description: string;
}

export interface StoryChapter {
  title: string;
  storySegment: string;
  illustrationPrompt: string;
  choices: string[];
  isEnd: boolean;
}

export interface SavedStory {
  id: string;
  title: string;
  genre: string;
  character: string;
  chapters: {
    segment: string;
    choiceMade?: string;
  }[];
  date: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  description: string;
  whyRecommended: string;
  difficulty: "Easy" | "Medium" | "Challenging";
  funActivity: string;
}

export interface SocialFeedPost {
  id: string;
  studentName: string;
  className: string;
  avatarSeed: string;
  bookTitle: string;
  author?: string;
  rating: number;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  tags: string[];
  photoUrl?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  className: string;
  createdAt: string;
}

export interface RecentBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  whyRecommended: string;
  difficulty: "Easy" | "Medium" | "Challenging";
  funActivity: string;
  status: "Available" | "Reserved" | "Reference Only";
  rackLocation: string;
  dateAdded: string;
  pages: number;
  gradeLevel: string;
}
