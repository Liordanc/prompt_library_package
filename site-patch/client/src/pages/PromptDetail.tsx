import { usePrompts } from '@/contexts/PromptContext';
import { useParams, Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight, Star, ExternalLink, Copy, Edit, Archive, Clock, Tag, Layers
} from 'lucide-react';
import { STATUS_LABELS, TYPE_LABELS, TOOL_LABELS, LABELS } from '@/lib/data';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function PromptDetail() {
  const { id } = useParams<{ id: string }>();
  const { prompts, toggleFavorite, archivePrompt, loading } = usePrompts();
  const [, setLocation] = useLocation();

  const prompt = prompts.find(p => p.Prompt_ID === id);

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

  const copyPreview = () => {
    navigator.clipboard.writeText(prompt.Preview_Text);
    toast.success('הטקסט הועתק ללוח');
  };

  const handleArchive = () => {
    archivePrompt(prompt.Prompt_ID);
    setLocation('/prompts');
  };

  const statusColor = {
    Active: 'bg-green-100 text-green-700',
    Draft: 'bg-purple-100 text-purple-700',
    Deprecated: 'bg-orange-100 text-orange-700',
    Archived: 'bg-gray-100 text-gray-600',
  }[prompt.Status] || 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/prompts" className="hover:text-foreground transition-colors">אינדקס פרומפטים</Link>
        <ArrowRight className="w-3 h-3 rotate-180" />
        <span className="text-foreground font-medium truncate">{prompt.Title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl sm:text-2xl font-bold">{prompt.Title}</h1>
            <button onClick={() => toggleFavorite(prompt.Prompt_ID)}>
              <Star className={`w-5 h-5 transition-colors ${prompt.Is_Favorite ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/40 hover:text-amber-400'}`} />
            </button>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{prompt.Description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={`${statusColor} text-xs`}>{STATUS_LABELS[prompt.Status]}</Badge>
            <Badge variant="secondary" className="text-xs">{prompt.Category}</Badge>
            {prompt.Subcategory && <Badge variant="outline" className="text-xs">{prompt.Subcategory}</Badge>}
            <Badge variant="outline" className="text-xs">{TYPE_LABELS[prompt.Prompt_Type]}</Badge>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/edit/${prompt.Prompt_ID}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Edit className="w-3.5 h-3.5" />
              עריכה
            </Button>
          </Link>
          <a href={prompt.Full_Doc_Link} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              פתח מסמך
            </Button>
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preview Text */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display">תצוגה מקדימה</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={copyPreview}>
                  <Copy className="w-3 h-3" />
                  העתק
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 rounded-lg p-4 text-sm leading-relaxed font-mono text-foreground/80 whitespace-pre-wrap max-h-80 overflow-y-auto" dir="ltr">
                {prompt.Preview_Text}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {prompt.Tags.length > 0 && (
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  תגיות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {prompt.Tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {prompt.Notes && (
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display">הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{prompt.Notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">פרטים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="מזהה" value={prompt.Prompt_ID} />
              <Separator />
              <InfoRow label="גרסה" value={prompt.Version} />
              <Separator />
              <InfoRow label="כלי יעד" value={TOOL_LABELS[prompt.Tool_Target] || prompt.Tool_Target} />
              <Separator />
              <InfoRow label="סוג" value={TYPE_LABELS[prompt.Prompt_Type] || prompt.Prompt_Type} />
              <Separator />
              <InfoRow label="מקור" value={prompt.Source || '—'} />
              <Separator />
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">נוצר:</span>
                <span>{prompt.Created_At}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">עודכן:</span>
                <span>{prompt.Updated_At}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">פעולות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" onClick={copyPreview}>
                <Copy className="w-3.5 h-3.5" />
                העתק תצוגה מקדימה
              </Button>
              <a href={prompt.Full_Doc_Link} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  פתח מסמך מלא
                </Button>
              </a>
              {prompt.Status !== 'Archived' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive">
                      <Archive className="w-3.5 h-3.5" />
                      העבר לארכיון
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>העברה לארכיון</AlertDialogTitle>
                      <AlertDialogDescription>
                        האם אתה בטוח שברצונך להעביר את הפרומפט "{prompt.Title}" לארכיון?
                        הפרומפט לא יימחק, אלא יועבר לקטגוריית הארכיון.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={handleArchive}>העבר לארכיון</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
