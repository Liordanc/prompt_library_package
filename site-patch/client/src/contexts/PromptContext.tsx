import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Prompt, CATEGORIES, TAGS, SUBCATEGORIES, MIGRATION_STEPS, type Category, type Tag, type Subcategory, type MigrationStep } from '@/lib/data';
import * as api from '@/lib/api';
import { toast } from 'sonner';

interface PromptContextType {
  prompts: Prompt[];
  categories: Category[];
  tags: Tag[];
  subcategories: Subcategory[];
  migrationSteps: MigrationStep[];
  loading: boolean;
  error: string | null;
  addPrompt: (prompt: Omit<Prompt, 'Prompt_ID' | 'Created_At' | 'Updated_At' | 'Version'>) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  archivePrompt: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addTag: (tag: Omit<Tag, 'Tag_ID' | 'Date_Created' | 'Date_Modified'>) => void;
  updateMigrationStep: (id: number, status: MigrationStep['status']) => void;
  refreshPrompts: () => void;
}

const PromptContext = createContext<PromptContextType | null>(null);

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories] = useState<Category[]>(CATEGORIES);
  const [tags, setTags] = useState<Tag[]>(TAGS);
  const [subcategories] = useState<Subcategory[]>(SUBCATEGORIES);
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>(MIGRATION_STEPS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrompts = useCallback(() => {
    setLoading(true);
    setError(null);
    api.fetchPrompts()
      .then(data => setPrompts(data))
      .catch(err => {
        console.error('Failed to load prompts:', err);
        setError(err.message);
        toast.error(`טעינת פרומפטים נכשלה: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const addPrompt = useCallback((prompt: Omit<Prompt, 'Prompt_ID' | 'Created_At' | 'Updated_At' | 'Version'>) => {
    api.createPrompt(prompt)
      .then(newPrompt => {
        setPrompts(prev => [newPrompt, ...prev]);
        toast.success('הפרומפט נוסף בהצלחה');
      })
      .catch(err => {
        toast.error(`שגיאה בהוספת הפרומפט: ${err.message}`);
      });
  }, []);

  const updatePrompt = useCallback((id: string, updates: Partial<Prompt>) => {
    setPrompts(prev => prev.map(p => {
      if (p.Prompt_ID !== id) return p;
      const now = new Date().toISOString().split('T')[0];
      const currentVersion = parseFloat(p.Version.replace('v', ''));
      const newVersion = `v${(currentVersion + 0.1).toFixed(1)}`;
      return { ...p, ...updates, Updated_At: now, Version: newVersion };
    }));
    toast.success('הפרומפט עודכן בהצלחה');
  }, []);

  const archivePrompt = useCallback((id: string) => {
    setPrompts(prev => prev.map(p =>
      p.Prompt_ID === id ? { ...p, Status: 'Archived', Category: 'ארכיון', Updated_At: new Date().toISOString().split('T')[0] } : p
    ));
    api.archivePromptApi(id)
      .then(() => toast.success('הפרומפט הועבר לארכיון'))
      .catch(err => {
        loadPrompts();
        toast.error(`שגיאה בהעברה לארכיון: ${err.message}`);
      });
  }, [loadPrompts]);

  const toggleFavorite = useCallback((id: string) => {
    setPrompts(prev => prev.map(p =>
      p.Prompt_ID === id ? { ...p, Is_Favorite: !p.Is_Favorite } : p
    ));
    api.toggleFavoriteApi(id).catch(err => {
      setPrompts(prev => prev.map(p =>
        p.Prompt_ID === id ? { ...p, Is_Favorite: !p.Is_Favorite } : p
      ));
      toast.error(`שגיאה בעדכון המועדף: ${err.message}`);
    });
  }, []);

  const addTag = useCallback((tag: Omit<Tag, 'Tag_ID' | 'Date_Created' | 'Date_Modified'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newTag: Tag = {
      ...tag,
      Tag_ID: `tag-${String(tags.length + 1).padStart(2, '0')}`,
      Date_Created: now,
      Date_Modified: now,
    };
    setTags(prev => [...prev, newTag]);
    toast.success('התגית נוספה בהצלחה');
  }, [tags.length]);

  const updateMigrationStep = useCallback((id: number, status: MigrationStep['status']) => {
    setMigrationSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success('סטטוס המיגרציה עודכן');
  }, []);

  return (
    <PromptContext.Provider value={{
      prompts, categories, tags, subcategories, migrationSteps,
      loading, error,
      addPrompt, updatePrompt, archivePrompt, toggleFavorite,
      addTag, updateMigrationStep,
      refreshPrompts: loadPrompts,
    }}>
      {children}
    </PromptContext.Provider>
  );
}

export function usePrompts() {
  const ctx = useContext(PromptContext);
  if (!ctx) throw new Error('usePrompts must be used within PromptProvider');
  return ctx;
}
