package planningcenter

type EventRelationship struct {
	Links map[string]any `json:"links"`
	Data  struct {
		Type string `json:"type"`
		Id   string `json:"id"`
	} `json:"data"`
}

type EventTimesRelationship struct {
	Links map[string]any `json:"links"`
	Data  []struct {
		Type string `json:"type"`
		Id   string `json:"id"`
	} `json:"data"`
}

type ResourceBookingsRelationship struct {
	Links map[string]any `json:"links"`
	Data  []struct {
		Type string `json:"type"`
		Id   string `json:"id"`
	} `json:"data"`
}

type TagsRelationship struct {
	Links map[string]any `json:"links"`
	Data  []struct {
		Type string `json:"type"`
		Id   string `json:"id"`
	} `json:"data"`
}

type EventInstance struct {
	Type       string `json:"type"`
	Id         string `json:"id"`
	Attributes struct {
		AllDayEvent                  bool   `json:"all_day_event"`
		ChurchCenterURL              string `json:"church_center_url"`
		CompactRecurrenceDescription string `json:"compact_recurrence_description"`
		CreatedAt                    string `json:"created_at"`
		EndsAt                       string `json:"ends_at"`
		ImageUrl                     string `json:"image_url"`
		Location                     string `json:"location"`
		PublishedEndsAt              string `json:"published_ends_at"`
		PublishedStartsAt            string `json:"published_starts_at"`
		Recurrence                   string `json:"recurrence"`
		RecurrenceDescription        string `json:"recurrence_description"`
		StartsAt                     string `json:"starts_at"`
		UpdatedAt                    string `json:"updated_at"`
	} `json:"attributes"`
	Relationships struct {
		Event            EventRelationship            `json:"event"`
		EventTimes       EventTimesRelationship       `json:"event_times"`
		ResourceBookings ResourceBookingsRelationship `json:"resource_bookings"`
		Tags             TagsRelationship             `json:"tags"`
	} `json:"relationships"`
	Links map[string]any `json:"links"`
}

type IncludedType struct {
	Type          string         `json:"type"`
	Id            string         `json:"id"`
	Attributes    map[string]any `json:"attributes"`
	Relationships map[string]any `json:"relationships"`
	Links         map[string]any `json:"links"`
}

type NewEventInstancesResponseType struct {
	Links    map[string]string `json:"links"`
	Data     []EventInstance   `json:"data"`
	Included []IncludedType    `json:"included"`
	Meta     map[string]any    `json:"meta"`
}
