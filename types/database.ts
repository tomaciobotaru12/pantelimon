export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          lat: number;
          lng: number;
          historical_period: string | null;
          cover_image: string | null;
          historical_image_url: string | null;
          current_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          lat: number;
          lng: number;
          historical_period?: string | null;
          cover_image?: string | null;
          historical_image_url?: string | null;
          current_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          lat?: number;
          lng?: number;
          historical_period?: string | null;
          cover_image?: string | null;
          historical_image_url?: string | null;
          current_image_url?: string | null;
          created_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          location_id: string | null;
          title: string;
          memory: string;
          year: number | null;
          tags: string[] | null;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location_id?: string | null;
          title: string;
          memory: string;
          year?: number | null;
          tags?: string[] | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location_id?: string | null;
          title?: string;
          memory?: string;
          year?: number | null;
          tags?: string[] | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
      };
      story_images: {
        Row: {
          id: string;
          story_id: string;
          image_url: string;
          is_historical: boolean;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          image_url: string;
          is_historical?: boolean;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          image_url?: string;
          is_historical?: boolean;
          caption?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Story = Database["public"]["Tables"]["stories"]["Row"];
export type StoryImage = Database["public"]["Tables"]["story_images"]["Row"];

export type StoryWithRelations = Story & {
  profile?: Profile | null;
  location?: Location | null;
  images?: StoryImage[];
};

export type LocationWithStories = Location & {
  stories?: StoryWithRelations[];
};
