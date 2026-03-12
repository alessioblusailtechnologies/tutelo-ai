export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  full_name?: string;
  avatar_url?: string;
  role?: string;
}
