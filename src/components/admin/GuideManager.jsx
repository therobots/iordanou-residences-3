const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

const defaultEntry = { category: 'landmark', title_en: '', title_el: '', description_en: '', description_el: '', image_url: '', property_id: '' };

export default function GuideManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultEntry);

  const { data: entries = [] } = useQuery({
    queryKey: ['guidebook'],
    queryFn: () => db.entities.Guidebook.list(),
    initialData: [],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => db.entities.Property.list(),
    initialData: [],
  });

  const createEntry = useMutation({
    mutationFn: (data) => db.entities.Guidebook.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['guidebook'] }); setOpen(false); setForm(defaultEntry); toast.success('Entry created'); },
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, data }) => db.entities.Guidebook.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['guidebook'] }); setOpen(false); setEditing(null); setForm(defaultEntry); toast.success('Entry updated'); },
  });

  const deleteEntry = useMutation({
    mutationFn: (id) => db.entities.Guidebook.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['guidebook'] }); toast.success('Entry deleted'); },
  });

  const handleEdit = (entry) => {
    setEditing(entry);
    setForm(entry);
    setOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      updateEntry.mutate({ id: editing.id, data: form });
    } else {
      createEntry.mutate(form);
    }
  };

  const categoryColors = {
    residence: 'bg-primary/10 text-primary border-primary/20',
    landmark: 'bg-amber-50 text-amber-700 border-amber-200',
    location: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">{t('guideManager')}</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(defaultEntry); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 font-body gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> {t('addGuideEntry')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{editing ? t('edit') : t('addGuideEntry')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label className="font-body text-sm">{t('category')}</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residence">{t('residence')}</SelectItem>
                    <SelectItem value="landmark">{t('landmark')}</SelectItem>
                    <SelectItem value="location">{t('location')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.category === 'residence' && (
                <div>
                  <Label className="font-body text-sm">Linked Property</Label>
                  <Select value={form.property_id} onValueChange={v => setForm(p => ({ ...p, property_id: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>
                      {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name_en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-body text-sm">Title (EN)</Label>
                  <Input value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value }))} className="mt-1 font-body" />
                </div>
                <div>
                  <Label className="font-body text-sm">Title (EL)</Label>
                  <Input value={form.title_el} onChange={e => setForm(p => ({ ...p, title_el: e.target.value }))} className="mt-1 font-body" />
                </div>
              </div>
              <div>
                <Label className="font-body text-sm">Description (EN)</Label>
                <Textarea value={form.description_en} onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))} className="mt-1 font-body" rows={3} />
              </div>
              <div>
                <Label className="font-body text-sm">Description (EL)</Label>
                <Textarea value={form.description_el} onChange={e => setForm(p => ({ ...p, description_el: e.target.value }))} className="mt-1 font-body" rows={3} />
              </div>
              <div>
                <Label className="font-body text-sm">Image URL</Label>
                <Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="mt-1 font-body" placeholder="https://..." />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 font-body" onClick={handleSave} disabled={!form.title_en || createEntry.isPending || updateEntry.isPending}>
                {t('save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-body text-xs">{t('title')}</TableHead>
              <TableHead className="font-body text-xs">{t('category')}</TableHead>
              <TableHead className="font-body text-xs">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-body text-sm font-medium">{e.title_en}</TableCell>
                <TableCell>
                  <Badge className={`${categoryColors[e.category]} border font-body text-xs`}>{e.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(e)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-red-50" onClick={() => deleteEntry.mutate(e.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}