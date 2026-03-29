// Message Kit Content Type
export type MessageKitContentType =
	| 'TEXT_TEMPLATE'
	| 'EMBED_TEMPLATE'
	| 'CONTAINER_TEMPLATE'
	| 'BUTTON_TEMPLATE'
	| 'SELECT_MENU_TEMPLATE';

// Message Kit - shareable template collection
export interface MessageKit {
	id: string;
	author_id?: string;
	name: string;
	description?: string;
	version: string;
	is_public: boolean;
	is_featured: boolean;
	download_count: number;
	tags: string[];
	created_at: string;
	updated_at: string;
	contents?: MessageKitContent[];
	author?: {
		id: string;
		username: string;
		avatar_url?: string;
	};
}

// Message Kit Content - individual template within a kit
export interface MessageKitContent {
	id: string;
	kit_id: string;
	content_type: MessageKitContentType;
	content_data: Record<string, unknown>;
	created_at: string;
}

// Message Kit Import - tracks when a kit is imported to a server
export interface MessageKitImport {
	id: string;
	kit_id: string;
	server_id: string;
	imported_by: string;
	imported_at: string;
	kit?: MessageKit;
}

// Message Kit Rating - user review
export interface MessageKitRating {
	id: string;
	kit_id: string;
	user_id: string;
	rating: number;
	review?: string;
	created_at: string;
	user?: {
		id: string;
		username: string;
		avatar_url?: string;
	};
}

// Create/Update Request Types
export interface CreateMessageKitRequest {
	name: string;
	description?: string;
	version?: string;
	is_public?: boolean;
	is_featured?: boolean;
	tags?: string[];
}

export interface UpdateMessageKitRequest {
	name?: string;
	description?: string | null;
	version?: string;
	is_public?: boolean;
	is_featured?: boolean;
	tags?: string[];
}

export interface AddContentRequest {
	content_type: MessageKitContentType;
	content_data: Record<string, unknown>;
}

export interface ImportKitRequest {
	server_id: string;
}

export interface CreateRatingRequest {
	rating: number;
	review?: string;
}

export interface UpdateRatingRequest {
	rating: number;
	review?: string;
}

export interface KitStats {
	average_rating: number;
	rating_count: number;
}