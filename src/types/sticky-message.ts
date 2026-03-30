// Sticky Message - auto-resends after N messages in a channel
export interface StickyMessage {
	id: string;
	server_id: string;
	channel_id: string;
	name: string;
	text_template_id?: string;
	embed_template_id?: string;
	container_template_id?: string;
	fallback_content?: string;
	trigger_count: number;
	current_count: number;
	discord_message_id?: string;
	is_active: boolean;
	created_by?: string;
	created_at: string;
	updated_at: string;
}

// Create/Update Request Types
export interface CreateStickyMessageRequest {
	channel_id: string;
	name: string;
	text_template_id?: string;
	embed_template_id?: string;
	container_template_id?: string;
	fallback_content?: string;
	trigger_count?: number;
	is_active?: boolean;
}

export interface UpdateStickyMessageRequest {
	channel_id?: string;
	name?: string;
	text_template_id?: string | null;
	embed_template_id?: string | null;
	container_template_id?: string | null;
	fallback_content?: string | null;
	trigger_count?: number;
	current_count?: number;
	is_active?: boolean;
	discord_message_id?: string | null;
}

export interface IncrementCountRequest {
	count?: number;
}