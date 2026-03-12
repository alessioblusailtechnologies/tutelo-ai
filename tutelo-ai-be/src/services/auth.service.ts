import { supabaseClient, supabaseAdmin } from '../config/supabase.js';
import { UnauthorizedError, NotFoundError } from '../utils/api-error.js';
import type { Profile, RegisterDto, LoginDto, UpdateProfileDto } from '../types/auth.types.js';

const TABLE = 'tutelo_profiles';

export const authService = {
  async register(dto: RegisterDto) {
    const { data, error } = await supabaseClient.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: { full_name: dto.full_name },
      },
    });

    if (error) throw new UnauthorizedError(error.message);
    return data;
  },

  async login(dto: LoginDto) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) throw new UnauthorizedError(error.message);
    return data;
  },

  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: created, error: createError } = await supabaseAdmin
        .from(TABLE)
        .insert({ id: userId })
        .select()
        .single();

      if (createError) throw createError;
      return created as Profile;
    }

    return data as Profile;
  },

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(dto)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundError('Profile not found');
    return data as Profile;
  },
};
