// Default Message Categories
export type MessageCategory =
	| 'ERROR'
	| 'LOG'
	| 'COMMAND'
	| 'WELCOME'
	| 'GOODBYE'
	| 'PUNISHMENT'
	| 'PROMOTION'
	| 'DEMOTION'
	| 'VERIFICATION'
	| 'TICKET';

// Default Message - override for built-in bot messages
export interface DefaultMessage {
	id: string;
	server_id: string;
	category: MessageCategory;
	key: string;
	name: string;
	description?: string;
	text_template_id?: string;
	embed_template_id?: string;
	container_template_id?: string;
	fallback_content?: string;
	variables: string[];
	is_active: boolean;
	created_by?: string;
	created_at: string;
	updated_at: string;
}

// Create/Update Request Types
export interface CreateDefaultMessageRequest {
	category: MessageCategory;
	key: string;
	name: string;
	description?: string;
	text_template_id?: string;
	embed_template_id?: string;
	container_template_id?: string;
	fallback_content?: string;
	variables?: string[];
	is_active?: boolean;
}

export interface UpdateDefaultMessageRequest {
	category?: MessageCategory;
	name?: string;
	description?: string;
	text_template_id?: string | null;
	embed_template_id?: string | null;
	container_template_id?: string | null;
	fallback_content?: string | null;
	variables?: string[];
	is_active?: boolean;
}

// Category labels for display
export const CATEGORY_LABELS: Record<MessageCategory, string> = {
	ERROR: 'Error Messages',
	LOG: 'Log Messages',
	COMMAND: 'Command Responses',
	WELCOME: 'Welcome Messages',
	GOODBYE: 'Goodbye Messages',
	PUNISHMENT: 'Punishment Messages',
	PROMOTION: 'Promotion Messages',
	DEMOTION: 'Demotion Messages',
	VERIFICATION: 'Verification Messages',
	TICKET: 'Ticket Messages',
};

// Common message keys by category
export const DEFAULT_MESSAGE_KEYS: Record<MessageCategory, string[]> = {
	ERROR: ['generic_error', 'permission_denied', 'not_found', 'rate_limit', 'cooldown'],
	LOG: ['action_logged', 'mod_log', 'join_log', 'leave_log', 'edit_log', 'delete_log'],
	COMMAND: ['command_success', 'command_usage', 'command_error', 'help_response'],
	WELCOME: ['member_join', 'member_join_dm', 'welcome_embed'],
	GOODBYE: ['member_leave', 'goodbye_embed'],
	PUNISHMENT: ['warn', 'mute', 'kick', 'ban', 'unban', 'unmute'],
	PROMOTION: ['rank_up', 'promotion_announcement', 'new_rank'],
	DEMOTION: ['rank_down', 'demotion_notice'],
	VERIFICATION: ['verify_instructions', 'verify_success', 'verify_pending', 'verify_group_join', 'verify_already_verified', 'verify_error'],
	TICKET: ['ticket_created', 'ticket_closed', 'ticket_transcript'],
};