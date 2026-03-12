import { supabaseAdmin } from '../config/supabase.js';
import { NotFoundError } from '../utils/api-error.js';
import type {
  Pratica, PraticaNote, PraticaArtifact,
  CreatePraticaDto, UpdatePraticaDto, CreateNoteDto, CreateArtifactDto,
} from '../types/pratica.types.js';

const T_PRATICHE = 'tutelo_pratiche';
const T_NOTES = 'tutelo_pratica_notes';
const T_ARTIFACTS = 'tutelo_pratica_artifacts';

export const praticaRepository = {
  // ─── Pratiche ──────────────────────────────────────
  async findAllByUserId(userId: string): Promise<Pratica[]> {
    const { data, error } = await supabaseAdmin
      .from(T_PRATICHE).select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Pratica[];
  },

  async findById(id: string, userId: string): Promise<Pratica> {
    const { data, error } = await supabaseAdmin
      .from(T_PRATICHE).select('*')
      .eq('id', id).eq('user_id', userId).single();
    if (error || !data) throw new NotFoundError('Pratica not found');
    return data as Pratica;
  },

  async create(userId: string, dto: Omit<CreatePraticaDto, 'generate_artifact'>): Promise<Pratica> {
    const { data, error } = await supabaseAdmin
      .from(T_PRATICHE)
      .insert({ ...dto, user_id: userId })
      .select().single();
    if (error) throw error;
    return data as Pratica;
  },

  async update(id: string, userId: string, dto: UpdatePraticaDto): Promise<Pratica> {
    const { data, error } = await supabaseAdmin
      .from(T_PRATICHE).update(dto)
      .eq('id', id).eq('user_id', userId)
      .select().single();
    if (error || !data) throw new NotFoundError('Pratica not found');
    return data as Pratica;
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(T_PRATICHE).delete()
      .eq('id', id).eq('user_id', userId);
    if (error) throw error;
  },

  // ─── Notes ─────────────────────────────────────────
  async findNotes(praticaId: string): Promise<PraticaNote[]> {
    const { data, error } = await supabaseAdmin
      .from(T_NOTES).select('*')
      .eq('pratica_id', praticaId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as PraticaNote[];
  },

  async createNote(praticaId: string, userId: string, dto: CreateNoteDto): Promise<PraticaNote> {
    const { data, error } = await supabaseAdmin
      .from(T_NOTES)
      .insert({ pratica_id: praticaId, user_id: userId, ...dto })
      .select().single();
    if (error) throw error;
    return data as PraticaNote;
  },

  async removeNote(noteId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(T_NOTES).delete()
      .eq('id', noteId).eq('user_id', userId);
    if (error) throw error;
  },

  // ─── Artifacts ─────────────────────────────────────
  async findArtifacts(praticaId: string): Promise<PraticaArtifact[]> {
    const { data, error } = await supabaseAdmin
      .from(T_ARTIFACTS).select('*')
      .eq('pratica_id', praticaId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as PraticaArtifact[];
  },

  async createArtifact(praticaId: string, dto: CreateArtifactDto): Promise<PraticaArtifact> {
    const { data, error } = await supabaseAdmin
      .from(T_ARTIFACTS)
      .insert({ pratica_id: praticaId, ...dto })
      .select().single();
    if (error) throw error;
    return data as PraticaArtifact;
  },

  async updateArtifact(artifactId: string, content: string): Promise<PraticaArtifact> {
    const { data, error } = await supabaseAdmin
      .from(T_ARTIFACTS).update({ content })
      .eq('id', artifactId)
      .select().single();
    if (error || !data) throw new NotFoundError('Artifact not found');
    return data as PraticaArtifact;
  },

  async removeArtifact(artifactId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(T_ARTIFACTS).delete()
      .eq('id', artifactId);
    if (error) throw error;
  },
};
