export const navLinks = [
  { label: 'How to Play', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Categories', href: '/categories' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'FAQ', href: '#faq' },
];

export const socialStats = [
  { value: 25, suffix: 'K+', label: 'Rooms created' },
  { value: 120, suffix: 'K+', label: 'Players' },
  { value: 4.9, suffix: '/5', label: 'Player rating', decimals: 1 },
];

export const heroAvatarColors = [
  'from-pink-500 to-rose-600',
  'from-purple-500 to-indigo-600',
  'from-cyan-400 to-blue-600',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-teal-600',
];

export const howToPlaySteps = [
  {
    num: '01',
    title: 'Create a room',
    desc: 'Spin up a private room in seconds. Share the code with your friends and get everyone in.',
    icon: 'Plus',
  },
  {
    num: '02',
    title: 'Choose a category',
    desc: 'Pick from 12+ categories — Science, History, Movies, Gaming, and more. Or go random.',
    icon: 'Grid',
  },
  {
    num: '03',
    title: 'Answer and bluff',
    desc: 'Submit your answer — real or completely made up. The goal? Make everyone believe you.',
    icon: 'MessageCircle',
  },
  {
    num: '04',
    title: 'Find the trap',
    desc: 'Vote for who you think is bluffing. Spot the trap correctly, earn points. Get trapped? Lose them.',
    icon: 'Eye',
  },
];

export const gameplayPhases = [
  { phase: 'question', label: 'ROUND 2 / 5', category: 'SCIENCE', question: 'Which planet has the shortest day?' },
  { phase: 'answers', label: 'SUBMIT YOUR ANSWER' },
  { phase: 'bluffing', label: "WHO IS BLUFFING?" },
  { phase: 'voting', label: 'VOTE' },
  { phase: 'reveal', label: 'THE TRAP WAS...' },
];

export const categories = [
  { emoji: '🌍', name: 'Geography', questions: '2,400', difficulty: 'Medium', color: '#19D9ED', glow: 'rgba(25,217,237,0.15)' },
  { emoji: '🏛️', name: 'History', questions: '3,100', difficulty: 'Hard', color: '#FFD166', glow: 'rgba(255,209,102,0.15)' },
  { emoji: '🧪', name: 'Science', questions: '2,800', difficulty: 'Hard', color: '#34D399', glow: 'rgba(52,211,153,0.15)' },
  { emoji: '🎬', name: 'Movies & TV', questions: '4,200', difficulty: 'Easy', color: '#FF4F81', glow: 'rgba(255,79,129,0.15)' },
  { emoji: '⚽', name: 'Sports', questions: '1,900', difficulty: 'Medium', color: '#3B82F6', glow: 'rgba(59,130,246,0.15)' },
  { emoji: '🎨', name: 'Art & Culture', questions: '1,500', difficulty: 'Medium', color: '#A855F7', glow: 'rgba(168,85,247,0.15)' },
  { emoji: '💻', name: 'Technology', questions: '2,200', difficulty: 'Hard', color: '#19D9ED', glow: 'rgba(25,217,237,0.15)' },
  { emoji: '🎵', name: 'Music', questions: '3,400', difficulty: 'Easy', color: '#FF4F81', glow: 'rgba(255,79,129,0.15)' },
  { emoji: '🍔', name: 'Food & Drink', questions: '1,700', difficulty: 'Easy', color: '#FFD166', glow: 'rgba(255,209,102,0.15)' },
  { emoji: '🦁', name: 'Animals', questions: '2,100', difficulty: 'Easy', color: '#34D399', glow: 'rgba(52,211,153,0.15)' },
  { emoji: '🚀', name: 'Space', questions: '1,800', difficulty: 'Hard', color: '#A855F7', glow: 'rgba(168,85,247,0.15)' },
  { emoji: '🎮', name: 'Gaming', questions: '2,600', difficulty: 'Medium', color: '#3B82F6', glow: 'rgba(59,130,246,0.15)' },
];

export const features = [
  { emoji: '🎭', title: 'Bluff mechanics', desc: 'Not just trivia — submit fake answers and trick your friends into voting for them.', icon: 'Drama' },
  { emoji: '🧠', title: 'Fast thinking', desc: 'Speed matters. The faster you answer, the more points you earn. But is it correct?', icon: 'Brain' },
  { emoji: '👥', title: 'Multiplayer', desc: 'Play with 2 to 12 friends. The more players, the more chaos, the more fun.', icon: 'Users' },
  { emoji: '⚡', title: 'Real-time gameplay', desc: 'See everyone\'s answers, votes, and reactions in real time. No waiting around.', icon: 'Zap' },
  { emoji: '🏆', title: 'Competitive scoring', desc: 'Earn points for correct answers and successful bluffs. Climb the leaderboard.', icon: 'Trophy' },
  { emoji: '🎯', title: 'Strategic voting', desc: 'Read the room. Spot the bluffer. Vote wisely. It\'s part trivia, part poker.', icon: 'Target' },
];

export const livePlayers = [
  { name: 'Alex', status: 'Answering...', color: 'from-cyan-400 to-blue-600', statusColor: 'text-cyan-400' },
  { name: 'Sarah', status: 'Choosing category...', color: 'from-pink-500 to-rose-600', statusColor: 'text-pink-400' },
  { name: 'Mike', status: 'Voting...', color: 'from-amber-400 to-orange-600', statusColor: 'text-amber-400' },
  { name: 'Qifrey', status: 'Online', color: 'from-purple-500 to-indigo-600', statusColor: 'text-emerald-400' },
];

export const leaderboard = [
  { rank: 1, name: 'Qifrey', score: 2450, color: 'from-purple-500 to-indigo-600' },
  { rank: 2, name: 'Alex', score: 2120, color: 'from-cyan-400 to-blue-600' },
  { rank: 3, name: 'Sarah', score: 1980, color: 'from-pink-500 to-rose-600' },
  { rank: 4, name: 'Mike', score: 1840, color: 'from-amber-400 to-orange-600' },
];

export const floatingHeroElements = [
  { text: "WHO'S BLUFFING?", color: 'text-pink-400', borderColor: 'border-pink-500/30', bg: 'bg-pink-500/10', top: '8%', left: '2%', delay: 0 },
  { text: '+250', color: 'text-emerald-400', borderColor: 'border-emerald-500/30', bg: 'bg-emerald-500/10', top: '28%', left: '85%', delay: 0.5 },
  { text: 'ROUND 3', color: 'text-cyan-400', borderColor: 'border-cyan-500/30', bg: 'bg-cyan-500/10', top: '55%', left: '5%', delay: 1 },
  { text: 'TRAP!', color: 'text-red-400', borderColor: 'border-red-500/30', bg: 'bg-red-500/10', top: '70%', left: '80%', delay: 1.5 },
  { text: 'CORRECT', color: 'text-yellow-400', borderColor: 'border-yellow-500/30', bg: 'bg-yellow-500/10', top: '42%', left: '90%', delay: 2 },
];

export const faqs = [
  { q: 'How many players can join a room?', a: 'Trivia Trap supports 2 to 12 players per room. The sweet spot is 4-8 for the best bluffing chaos.' },
  { q: 'Do I need to install anything?', a: 'Nope! Trivia Trap runs entirely in your browser. Just share the room code and everyone can join instantly.' },
  { q: 'Is it free to play?', a: 'Yes, Trivia Trap is completely free. Create a room, invite your friends, and start playing in seconds.' },
  { q: 'Can I play on my phone?', a: 'Absolutely. Trivia Trap works on any device with a browser — phone, tablet, or desktop.' },
  { q: 'What if I don\'t know the answer?', a: 'That\'s the fun part! If you don\'t know, make something up. Your fake answer might fool everyone.' },
];
