import { useState, useEffect } from 'react';
import { usePrompts } from '@/contexts/PromptContext';
import { useParams, useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { STATUSES, PROMPT_TYPES, TOOL_TARGETS, STATUS_LABELS, TYPE_LABELS, TOOL_LABELS } from '@/lib/data';
import { toast } from 'sonner';

export default function EditPrompt() {
  const { id } = useParams<{ id: string }>();
  const { prompts, categories, subcategories, tags, updatePrompt, loading } = usePrompts();
  const [, setLocation] = useLocation();

  const prompt = prompts.find(p => p.Prompt_ID === id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toolTarget, setToolTarget] = useState('ChatGPT');
  const [promptType, setPromptType] = useState('General');
  const [status, setStatus] = useState('Active');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.Title);
      setCategory(prompt.Category);
      setSubcategory(prompt.Subcategory);
      setDescription(prompt.Description);
      setPreviewText(prompt.Preview_Text);
      setSelectedTags(prompt.Tags);
      setIsFavorite(prompt.Is_Favorite);
      setToolTarget(prompt.Tool_Target);
      setPromptType(prompt.Prompt_Type);
      setStatus(prompt.Status);
      setSource(prompt.Source);
      setNotes(prompt.Notes);
    }
  }, [prompt]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">טוען פרומפט...</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">הפרומפט לא נמצא</p>
        <Link href="/prompts">
          <Button variant="outline" className="mt-4">חזרה לאינדקס</Button>
        </Link>
      </div>
    );
  }

  const filteredSubcategories = subcategories.filter(s => s.Category === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('כותרת היא שדה חובה'); return; }
    if (!category) { toast.error('קטגוריה היא שדה חובה'); return; }

    updatePrompt(prompt.Prompt_ID, {
      Title: title.trim(),
      Category: category,
      Subcategory: subcategory,
      Description: description.trim(),
      Preview_Text: previewText.trim().slice(0, 1500),
      Tags: selectedTags,
      Is_Favorite: isFavorite,
      Tool_Target: toolTarget,
      Prompt_Type: promptType,
      Status: status,
      Source: source.trim(),
      Notes: notes.trim(),
    });

    setLocation(`/prompts/${prompt.Prompt_ID}`);
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">עריכת פרומפט</h1>
        <p className="text-muted-foreground text-sm mt-1">עדכון {prompt.Title} — גרסה נוכחית: {prompt.Version}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">מידע בסיסי</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>קטגוריה *</Label>
                <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(''); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.Category_ID} value={c.Category}>{c.Category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>תת-קטגוריה</Label>
                <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                  <SelectTrigger><SelectValue placeholder="בחר" /></SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.map(s => (
                      <SelectItem key={s.Subcategory_ID} value={s.Subcategory}>{s.Subcategory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">תוכן הפרומפט</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={previewText}
              onChange={e => setPreviewText(e.target.value)}
              rows={8}
              dir="ltr"
              className="font-mono text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{previewText.length}/1,500 תווים</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">סיווג</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>סוג פרומפט</Label>
                <Select value={promptType} onValueChange={setPromptType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROMPT_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>כלי יעד</Label>
                <Select value={toolTarget} onValueChange={setToolTarget}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TOOL_TARGETS.map(t => (
                      <SelectItem key={t} value={t}>{TOOL_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>תגיות</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.Tag_ID}
                    type="button"
                    onClick={() => toggleTag(tag.Tag_Name)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-smooth ${
                      selectedTags.includes(tag.Tag_Name)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {tag.Tag_Name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isFavorite} onCheckedChange={setIsFavorite} id="favorite" />
              <Label htmlFor="favorite" className="text-sm">סמן כמועדף</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">מידע נוסף</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source">מקור</Label>
              <Input id="source" value={source} onChange={e => setSource(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1 sm:flex-none sm:px-8">שמור שינויים</Button>
          <Button type="button" variant="outline" onClick={() => setLocation(`/prompts/${prompt.Prompt_ID}`)}>ביטול</Button>
        </div>
      </form>
    </div>
  );
}
