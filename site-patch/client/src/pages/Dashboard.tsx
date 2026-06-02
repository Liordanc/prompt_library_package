import { usePrompts } from '@/contexts/PromptContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
  FileText, Star, PenLine, Archive, Clock, Plus, ArrowLeft,
  CheckCircle2, AlertCircle, TrendingUp, ShieldCheck as ShieldCheckIcon
} from 'lucide-react';

export default function Dashboard() {
  const { prompts, migrationSteps, loading, error } = usePrompts();

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
          <p className="text-xs text-muted-foreground">ודא שקובץ .env מוגדר עם GAS_WEB_APP_URL ו-GAS_AGENT_TOKEN</p>
        </div>
      </div>
    );
  }

  const totalPrompts = prompts.length;
  const activePrompts = prompts.filter(p => p.Status === 'Active').length;
  const favoritePrompts = prompts.filter(p => p.Is_Favorite).length;
  const draftPrompts = prompts.filter(p => p.Status === 'Draft').length;
  const archivedPrompts = prompts.filter(p => p.Status === 'Archived').length;

  const recentPrompts = [...prompts]
    .sort((a, b) => b.Updated_At.localeCompare(a.Updated_At))
    .slice(0, 5);

  const completedMigration = migrationSteps.filter(s => s.status === 'completed').length;
  const totalMigration = migrationSteps.length;

  const stats = [
    { label: 'סה"כ פרומפטים', value: totalPrompts, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'פעילים', value: activePrompts, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'מועדפים', value: favoritePrompts, icon: Star, color: 'text-amber-600 bg-amber-50' },
    { label: 'טיוטות', value: draftPrompts, icon: PenLine, color: 'text-purple-600 bg-purple-50' },
    { label: 'בארכיון', value: archivedPrompts, icon: Archive, color: 'text-gray-600 bg-gray-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">לוח בקרה</h1>
          <p className="text-muted-foreground mt-1">סקירה כללית של ספריית הפרומפטים שלך</p>
        </div>
        <Link href="/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            פרומפט חדש
          </Button>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-48">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663698042677/mPcwEZamkD2dWLuoP26qrK/hero-abstract-fpcNpDGLf9gbg6GC7gCDtD.webp"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-transparent flex items-center">
          <div className="p-6 sm:p-8 text-white">
            <h2 className="font-display text-xl sm:text-2xl font-bold">ספריית הפרומפטים האישית</h2>
            <p className="text-white/80 mt-1 text-sm sm:text-base">ניהול, אינדוקס וגרסאות — הכל במקום אחד</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="border border-border/60 shadow-sm hover:shadow-md transition-smooth">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold font-display">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Prompts */}
        <Card className="lg:col-span-2 border border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display">עודכנו לאחרונה</CardTitle>
              <Link href="/prompts">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  הצג הכל
                  <ArrowLeft className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPrompts.map(prompt => (
              <Link key={prompt.Prompt_ID} href={`/prompts/${prompt.Prompt_ID}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-smooth group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{prompt.Title}</p>
                      {prompt.Is_Favorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{prompt.Category}</Badge>
                      <span className="text-[10px] text-muted-foreground">{prompt.Version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    <span className="text-[11px]">{prompt.Updated_At}</span>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Migration & Quick Actions */}
        <div className="space-y-4">
          {/* Migration Status */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">סטטוס מיגרציה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(completedMigration / totalMigration) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {completedMigration}/{totalMigration}
                </span>
              </div>
              <div className="space-y-1.5">
                {migrationSteps.slice(0, 4).map(step => (
                  <div key={step.id} className="flex items-center gap-2 text-xs">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : step.status === 'in_progress' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    <span className={step.status === 'completed' ? 'text-muted-foreground line-through' : ''}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/migration">
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                  צפה בכל השלבים
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">פעולות מהירות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/add">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                  <Plus className="w-3.5 h-3.5" /> הוסף פרומפט חדש
                </Button>
              </Link>
              <Link href="/prompts">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5" /> חפש באינדקס
                </Button>
              </Link>
              <Link href="/validation">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                  <ShieldCheckIcon className="w-3.5 h-3.5" /> הרץ ולידציה
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


