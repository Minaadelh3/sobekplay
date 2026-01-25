import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface Feedback {
  id: string;
  name: string;
  comment: string;
}

export default function FeedbackSection({ movieId }: { movieId: string }) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "feedback"),
      where("movieId", "==", movieId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setFeedbacks(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Feedback, "id">),
        }))
      );
    });

    return () => unsub();
  }, [movieId]);

  const submitComment = async () => {
    if (!name || !comment) return;

    await addDoc(collection(db, "feedback"), {
      movieId,
      name,
      comment,
      createdAt: serverTimestamp(),
    });

    setComment("");
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h3>Feedback</h3>

      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        placeholder="Write your comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button onClick={submitComment}>Send</button>

      <div>
        {feedbacks.map((f) => (
          <div key={f.id}>
            <strong>{f.name}</strong>
            <p>{f.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
