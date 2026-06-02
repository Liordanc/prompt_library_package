import { useState, useMemo } from 'react';
import { usePrompts } from '@/contexts/PromptContext';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Star, ExternalLink, Copy, Grid3X3, List, SortAsc, SortDesc
} from 'lucide-react';
import { STATUS_LABELS, TYPE_LABELS, TOOL_LABELS } from '@/lib/data';
import { toast } from 'sonner';

type SortField = 'Updated_At' | 'Created_At' | 'Title' | 'Category' | 'Status';
type ViewMode = 'table' | 'cards';

export default function PromptIndex() {
  const { prompts, categories, tags, toggleFavorite, loading, error } = usePrompts();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterTool, setFilterTool] = useState('all');
  const [filterFavorite, setFilterFavorite] = useState('all');
  const [sortField, setSortField] = useState<SortField>('Updated_At');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const filtered = useMemo(() => {
    let result = [...prompts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.Title.toLowerCase().includes(q) ||
        p.Description.toLowerCase().includes(q) ||
        p.Preview_Text.toLowerCase().includes(q) ||
        p.Tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filterCategory !== 'all') result = result.filter(p => p.Category === filterCategory);
    if (filterStatus !== 'all') result = result.filter(p => p.Status === filterStatus);
    if (filterType !== 'all') result = result.filter(p => p.Prompt_Type === filterType);
    if (filterTool !== 'all') result = result.filter(p => p.Tool_Target === filterTool);
    if (filterFavorite === 'yes') result = result.filter(p => p.Is_Favorite);

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [prompts, search, filterCategory, filterStatus, filterType, filterTool, filterFavorite, sortField, sortDir]);

  const copyPreview = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('הטקסט הועתק ללוח');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">טוען פרומפטים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3 max-w-md">
          <p className="text-destructive font-medium">שגיאה בטעינת הנתונים</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">אינדקס פרומפטים</h1>
        <p className="text-muted-foreground text-sm mt-1">{filtered.length} מתוך {prompts.length} פרומפטים</p>
      </div>

      {/* Search & Filters */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש חופשי..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.Category_ID} value={c.Category}>{c.Category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="סוג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסוגים</SelectItem>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTool} onValueChange={setFilterTool}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="כלי יעד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הכלים</SelectItem>
                {Object.entries(TOOL_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFavorite} onValueChange={setFilterFavorite}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="מועדפים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="yes">מועדפים בלבד</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                <SelectTrigger className="text-xs h-9 flex-1">
                  <SelectValue placeholder="מיון" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Updated_At">תאריך עדכון</SelectItem>
                  <SelectItem value="Created_At">תאריך יצירה</SelectItem>
                  <SelectItem value="Title">כותרת</SelectItem>
                  <SelectItem value="Category">קטגוריה</SelectItem>
                  <SelectItem value="Status">סטטוס</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                {sortDir === 'asc' ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-end gap-1">
            <Button variant={viewMode === 'cards' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('cards')}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('table')}>
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663698042677/mPcwEZamkD2dWLuoP26qrK/empty-state-M4eWtshVnKdZzH3E7ytcba.webp"
            alt="Empty"
            className="w-32 h-32 mx-auto mb-4 opacity-70"
          />
          <p className="text-muted-foreground font-medium">לא נמצאו פרומפטים</p>
          <p className="text-xs text-muted-foreground mt-1">נסה לשנות את הפילטרים או את מילות החיפוש</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(prompt => (
            <Card key={prompt.Prompt_ID} className="border border-border/60 shadow-sm hover:shadow-md transition-smooth group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/prompts/${prompt.Prompt_ID}`}>
                    <h3 className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1">{prompt.Title}</h3>
                  </Link>
                  <button onClick={() => toggleFavorite(prompt.Prompt_ID)} className="shrink-0">
                    <Star className={`w-4 h-4 transition-colors ${prompt.Is_Favorite ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/40 hover:text-amber-400'}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{prompt.Description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{prompt.Category}</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{STATUS_LABELS[prompt.Status] || prompt.Status}</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{prompt.Tool_Target}</Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{prompt.Version} • {prompt.Updated_At}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyPreview(prompt.Preview_Text)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <a href={prompt.Full_Doc_Link} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right p-3 font-medium">כותרת</th>
                <th className="text-right p-3 font-medium">קטגוריה</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">סוג</th>
                <th className="text-right p-3 font-medium hidden md:table-cell">כלי</th>
                <th className="text-right p-3 font-medium">סטטוס</th>
                <th className="text-right p-3 font-medium hidden lg:table-cell">גרסה</th>
                <th className="text-right p-3 font-medium hidden lg:table-cell">עודכן</th>
                <th className="text-center p-3 font-medium w-20">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map(prompt => (
                <tr key={prompt.Prompt_ID} className="hover:bg-accent/30 transition-colors">
                  <td className="p-3">
                    <Link href={`/prompts/${prompt.Prompt_ID}`}>
                      <span className="font-medium hover:text-primary transition-colors flex items-center gap-1.5">
                        {prompt.Is_Favorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        {prompt.Title}
                      </span>
                    </Link>
                  </td>
                  <td className="p-3">{prompt.Category}</td>
                  <td className="p-3 hidden sm:table-cell">{TYPE_LABELS[prompt.Prompt_Type] || prompt.Prompt_Type}</td>
                  <td className="p-3 hidden md:table-cell">{prompt.Tool_Target}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-[10px]">{STATUS_LABELS[prompt.Status] || prompt.Status}</Badge>
                  </td>
                  <td className="p-3 hidden lg:table-cell">{prompt.Version}</td>
                  <td className="p-3 hidden lg:table-cell">{prompt.Updated_At}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyPreview(prompt.Preview_Text)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <a href={prompt.Full_Doc_Link} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
