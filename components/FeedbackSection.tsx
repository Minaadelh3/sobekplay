import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  Timestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackSectionProps {
  movieId: string;
}

interface Comment {
  id: string;
  movieId: string;
  userName: string;
  commentText: string;
  timestamp: Timestamp | null;
  reactions: {
    like: number;
    love: number;
    funny: number;
    crocodile: number;
  };
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ movieId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Subscribe to comments for this movie
  useEffect(() => {
    if (!db) return;

    try {
      const q = query(
        collection(db, 'comments'),
        where('movieId', '==', movieId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedComments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Comment[];
        setComments(loadedComments);
      }, (err) => {
        console.error("Firebase error:", err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Error setting up listener", e);
    }
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!userName.trim() || !commentText.trim()) {
      setError('Please fill in both name and comment.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'comments'), {
        movieId,
        userName: userName.trim(),
        commentText: commentText.trim(),
        timestamp: serverTimestamp(),
        reactions: {
          like: 0,
          love: 0,
          funny: 0,
          crocodile: 0
        }
      });
      setCommentText(''); // Clear input after successful post
    } catch (err: any) {
      console.error(err);
      setError('Failed to post comment. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (commentId: string, type: 'like' | 'love' | 'funny' | 'crocodile') => {
    const storageKey = `reacted_${commentId}`;
    if (localStorage.getItem(storageKey)) {
      // User already reacted to this comment
      return;
    }

    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        [`reactions.${type}`]: increment(1)
      });
      localStorage.setItem(storageKey, 'true');
    } catch (err) {
      console.error("Error updating reaction:", err);
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-charcoal/30 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-accent-gold">Community</span> Feedback
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-12 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-nearblack border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent-green transition-colors"
              maxLength={20}
            />
          </div>
          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="Share your thoughts on this title..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-nearblack border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-accent-green transition-colors"
              maxLength={200}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-red-400 text-sm h-5">{error}</p>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              isSubmitting 
                ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                : 'bg-accent-green text-white hover:bg-opacity-90'
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="bg-charcoal p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green to-accent-gold flex items-center justify-center text-xs font-bold text-white">
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-white block leading-none">{comment.userName}</span>
                    <span className="text-xs text-muted">{formatDate(comment.timestamp)}</span>
                  </div>
                </div>
              </div>

              <p className="text-white/90 leading-relaxed mb-4 pl-11">
                {comment.commentText}
              </p>

              {/* Reactions */}
              <div className="flex gap-4 pl-11">
                <button 
                  onClick={() => handleReaction(comment.id, 'like')}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-white transition-colors bg-white/5 px-2 py-1 rounded-md hover:bg-white/10"
                >
                  <span>👍</span>
                  <span>{comment.reactions?.like || 0}</span>
                </button>
                <button 
                  onClick={() => handleReaction(comment.id, 'love')}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-pink-400 transition-colors bg-white/5 px-2 py-1 rounded-md hover:bg-white/10"
                >
                  <span>❤️</span>
                  <span>{comment.reactions?.love || 0}</span>
                </button>
                <button 
                  onClick={() => handleReaction(comment.id, 'funny')}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-yellow-400 transition-colors bg-white/5 px-2 py-1 rounded-md hover:bg-white/10"
                >
                  <span>😂</span>
                  <span>{comment.reactions?.funny || 0}</span>
                </button>
                <button 
                  onClick={() => handleReaction(comment.id, 'crocodile')}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-green-400 transition-colors bg-white/5 px-2 py-1 rounded-md hover:bg-white/10"
                >
                  <span>🐊</span>
                  <span>{comment.reactions?.crocodile || 0}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <div className="text-center py-12 text-muted/40">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;