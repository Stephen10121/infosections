package planningcenter

type SpecificEventTimes struct {
	Name      string `json:"name"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
}

type Resource struct {
	Id       string `json:"id"`
	Kind     string `json:"kind"`
	Name     string `json:"name"`
	PathName string `json:"path_name"`
}

type EventTag struct {
	Id    string `json:"id"`
	Color string `json:"color"`
	Name  string `json:"name"`
}

type Event struct {
	InstanceId           string               `json:"instanceId"`
	StartTime            string               `json:"startTime"`
	EndTime              string               `json:"endTime"`
	Name                 string               `json:"name"`
	Location             string               `json:"location"`
	Times                []SpecificEventTimes `json:"times"`
	Resources            []Resource           `json:"resources"`
	Recurrence           string               `json:"recurrence"`
	Tags                 []EventTag           `json:"tags"`
	Description          string               `json:"description"`
	ImageURL             string               `json:"imageURL"`
	Featured             bool                 `json:"featured"`
	VisibleInChuchCenter bool                 `json:"visibleInChurchCenter"`
	RegistrationURL      string               `json:"registrationURL"`
}
