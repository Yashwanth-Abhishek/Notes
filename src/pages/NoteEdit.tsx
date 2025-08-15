import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import GlitchText from '@/components/GlitchText';

interface Note {
  id: string;
  title: string;
  content: string;
  notebook_id: string;
  created_at: string;
  updated_at: string;
}

interface Notebook {
  id: string;
  title: string;
}

export default function NoteEdit() {
  const { notebookId, noteId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [note, setNote] = useState<Note | null>(null);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (notebookId && noteId) {
      fetchData();
    }
  }, [user, navigate, notebookId, noteId]);

  useEffect(() => {
    if (note) {
      const hasChanges = title !== note.title || content !== note.content;
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, content, note]);

  const fetchData = async () => {
    try {
      // Fetch notebook
      const { data: notebookData, error: notebookError } = await supabase
        .from('notebooks')
        .select('id, title')
        .eq('id', notebookId)
        .single();

      if (notebookError) throw notebookError;
      setNotebook(notebookData);

      // Fetch note
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('notebook_id', notebookId)
        .single();

      if (noteError) throw noteError;
      setNote(noteData);
      setTitle(noteData.title);
      setContent(noteData.content || '');
    } catch (error) {
      toast({
        title: "Error loading note",
        description: "Please try again",
        variant: "destructive",
      });
      navigate(`/notebooks/${notebookId}`);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!note || saving) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: title.trim() || 'Untitled',
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id);

      if (error) throw error;

      setNote({ ...note, title: title.trim() || 'Untitled', content: content.trim() });
      setHasUnsavedChanges(false);
      
      toast({
        title: "Note saved",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving note",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave without saving?'
      );
      if (!confirmed) return;
    }
    navigate(`/notebooks/${notebookId}`);
  };

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeout = setTimeout(() => {
      saveNote();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeout);
  }, [title, content, hasUnsavedChanges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <FileText className="w-1.5 h-1.5 text-primary-foreground" />
                  </div>
                </div>
                <GlitchText
                  speed={1}
                  enableShadows={true}
                  enableOnHover={true}
                  className="text-lg font-bold"
                >
                  Notes
                </GlitchText>
              </div>
              <div className="text-muted-foreground">/</div>
              <div>
                <h1 className="text-lg font-medium">
                  {notebook?.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Editing note
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-muted-foreground">
                  Unsaved changes
                </span>
              )}
              <Button
                onClick={saveNote}
                disabled={saving || !hasUnsavedChanges}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="min-h-[500px] resize-none border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed"
            />
          </div>

          {/* Footer info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-8 border-t border-border">
            <div>
              Created: {note && new Date(note.created_at).toLocaleDateString()}
            </div>
            <div>
              Last saved: {note && new Date(note.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}