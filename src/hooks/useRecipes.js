import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, primaryAppId } from '../services/firebase';

export function useRecipes(user) {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    if (!user) return;
    const recipesRef = collection(db, 'artifacts', primaryAppId, 'public', 'data', 'recipes');
    const unsubscribe = onSnapshot(recipesRef, (snapshot) => {
      const fetchedRecipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedRecipes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRecipes(fetchedRecipes);
      localStorage.setItem('rashika_cached_recipes', JSON.stringify(fetchedRecipes));
    }, (error) => console.error("Fetch error:", error));

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user && !navigator.onLine) {
      const cached = localStorage.getItem('rashika_cached_recipes');
      if (cached) {
        try { setRecipes(JSON.parse(cached)); } catch(e){}
      }
    }
  }, [user]);

  const saveRecipe = async (recipeData, editingId) => {
    if (!user) throw new Error("Firebase Auth is disabled or failed. Please enable Anonymous Auth in your Firebase Console to save recipes.");

    if (editingId) {
      await updateDoc(doc(db, 'artifacts', primaryAppId, 'public', 'data', 'recipes', editingId), { 
        ...recipeData, 
        updatedAt: Date.now() 
      });
      return editingId;
    } else {
      const docRef = await addDoc(collection(db, 'artifacts', primaryAppId, 'public', 'data', 'recipes'), { 
        ...recipeData, 
        createdAt: Date.now(), 
        authorId: user.uid 
      });
      return docRef.id;
    }
  };

  const removeRecipe = async (id) => {
    await deleteDoc(doc(db, 'artifacts', primaryAppId, 'public', 'data', 'recipes', id));
  };

  return { recipes, saveRecipe, removeRecipe };
}
