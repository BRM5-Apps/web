export interface EmbedTemplate {
  id: string;
  factionId?: string;
  hubId?: string;
  name: string;
  title?: string;
  description?: string;
  color?: string;
  fields?: EmbedField[];
  footer?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  authorName?: string;
  authorIconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface ContainerTemplate {
  id: string;
  factionId?: string;
  hubId?: string;
  name: string;
  accentColor?: string;
  components: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface TextTemplate {
  id: string;
  factionId?: string;
  hubId?: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
