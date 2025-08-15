import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, ArrowLeft, CheckSquare, Square, Archive, Trash2, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import GlitchText from '@/components/GlitchText';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  sort_order: number;
}

interface Notebook {
  id: string;
  title: string;
}

export default function NotebookDetail() {
  const { notebookId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (notebookId) {
      fetchNotebook();
      fetchNotes();
    }
  }, [user, navigate, notebookId]);

  const fetchNotebook = async () => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select('id, title')
        .eq('id', notebookId)
        .single();

      if (error) throw error;
      setNotebook(data);
    } catch (error) {
      toast({
        title: "Error fetching notebook",
        description: "Please try again",
        variant: "destructive",
      });
      navigate('/notebooks');
    }
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('notebook_id', notebookId)
        .eq('is_archived', false)
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      toast({
        title: "Error fetching notes",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNoteTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: newNoteTitle.trim(),
          content: '',
          notebook_id: notebookId,
          user_id: user?.id,
          sort_order: notes.length
        }])
        .select()
        .single();

      if (error) throw error;

      setNotes([...notes, data]);
      setNewNoteTitle('');
      setCreateDialogOpen(false);
      
      // Navigate to edit the new note
      navigate(`/notebooks/${notebookId}/notes/${data.id}/edit`);
    } catch (error) {
      toast({
        title: "Error creating note",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async () => {
    if (!noteToDelete) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteToDelete.id);

      if (error) throw error;

      setNotes(notes.filter(n => n.id !== noteToDelete.id));
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
      
      toast({
        title: "Note deleted",
        description: `"${noteToDelete.title}" has been deleted`,
      });
    } catch (error) {
      toast({
        title: "Error deleting note",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const archiveNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_archived: true })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(n => n.id !== noteId));
      toast({
        title: "Note archived",
        description: "Note has been moved to archive",
      });
    } catch (error) {
      toast({
        title: "Error archiving note",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleNoteSelect = (noteId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotes);
    if (checked) {
      newSelected.add(noteId);
    } else {
      newSelected.delete(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const selectAllNotes = () => {
    if (selectedNotes.size === filteredNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(filteredNotes.map(note => note.id)));
    }
  };

  const bulkArchive = async () => {
    try {
      const noteIds = Array.from(selectedNotes);
      const { error } = await supabase
        .from('notes')
        .update({ is_archived: true })
        .in('id', noteIds);

      if (error) throw error;

      setNotes(notes.filter(n => !selectedNotes.has(n.id)));
      setSelectedNotes(new Set());
      setMultiSelectMode(false);
      
      toast({
        title: `${noteIds.length} notes archived`,
        description: "Notes have been moved to archive",
      });
    } catch (error) {
      toast({
        title: "Error archiving notes",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const bulkDelete = async () => {
    try {
      const noteIds = Array.from(selectedNotes);
      const { error } = await supabase
        .from('notes')
        .delete()
        .in('id', noteIds);

      if (error) throw error;

      setNotes(notes.filter(n => !selectedNotes.has(n.id)));
      setSelectedNotes(new Set());
      setMultiSelectMode(false);
      
      toast({
        title: `${noteIds.length} notes deleted`,
        description: "Notes have been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error deleting notes",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/notebooks')}>
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
              <h1 className="text-2xl font-bold">{notebook?.title}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={multiSelectMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setMultiSelectMode(!multiSelectMode);
                  setSelectedNotes(new Set());
                }}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {multiSelectMode ? 'Exit Select' : 'Select'}
              </Button>
              
              <Button
                onClick={() => setCreateDialogOpen(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>

          {/* Multi-select toolbar */}
          {multiSelectMode && (
            <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllNotes}
                >
                  {selectedNotes.size === filteredNotes.length ? (
                    <CheckSquare className="w-4 h-4 mr-2" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  Select All ({filteredNotes.length})
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedNotes.size} selected
                </span>
              </div>
              
              {selectedNotes.size > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkArchive}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={bulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first note to get started'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="note-card cursor-pointer group relative"
                onClick={() => {
                  if (!multiSelectMode) {
                    navigate(`/notebooks/${notebookId}/notes/${note.id}/edit`);
                  }
                }}
              >
                {multiSelectMode && (
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedNotes.has(note.id)}
                      onCheckedChange={(checked) => handleNoteSelect(note.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                
                <CardHeader className={`flex flex-row items-start justify-between space-y-0 pb-3 ${multiSelectMode ? 'ml-8' : ''}`}>
                  <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {note.title}
                  </CardTitle>
                  {!multiSelectMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveNote(note.id);
                          }}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteToDelete(note);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                <CardContent className={multiSelectMode ? 'ml-8' : ''}>
                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {note.content}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Note Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Give your note a title to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Note Title</Label>
              <Input
                id="title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                onKeyDown={(e) => e.key === 'Enter' && createNote()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNote} disabled={!newNoteTitle.trim()}>
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{noteToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteNote}>
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}