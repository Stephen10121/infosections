import type { RecordModel } from "pocketbase";

export interface ServiceTypeDBModel extends RecordModel {
	owner: string;
	frequency: string;
	name: string;
	sequence: number;
	created: string;
	updated: string;
}

export interface PlanItem {
	description: string;
	item_type: "song" | "header" | "media" | "item";
	key_name: string;
	length: number;
	sequence: number;
	service_position: "pre" | "post" | "during";
	title: string;
}

export interface PlanDBModel extends RecordModel {
	title: string;
	owner: string;
	service_type: string;
	dates: string;
	items_count: number;
	multi_day: boolean;
	needed_positions_count: number;
	other_time_count: number;
	plan_notes_count: number;
	plan_people_count: number;
	prefers_order_view: boolean;
	public: boolean;
	public_by_schedule: boolean;
	rehearsable: boolean;
	rehearsal_time_count: number;
	reminders_disabled: boolean;
	series_title: string;
	service_time_count: number;
	total_length: number;
	items: PlanItem[];
	sort_date: string;
	created: string;
	updated: string;
}

export interface AServiceDisplaySettings {
	theme: "minimal" | "bulletin" | "full";
	show_series_information: boolean;
	show_service_times: boolean;
	show_song_list: boolean;
	show_notes: boolean;
}

export interface AServiceDBModel extends RecordModel {
	public_id: string;
	name: string;
	description: string;
	logo: string;
	service_type: string;
	owner: string;
	custom_intro: string;
	display_settings: AServiceDisplaySettings;
	views: number;
	prints: number;
	shares: number;
	created: string;
	updated: string;
}
