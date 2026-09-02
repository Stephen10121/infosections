package planningcenter

import (
	"encoding/json"
	"net/http"

	"github.com/pocketbase/pocketbase"
)

type PlanTimesRelation struct {
	Type string `json:"type"`
	Id   string `json:"id"`
}

type PlanRaw struct {
	Type       string `json:"type"`
	Id         string `json:"id"`
	Attributes struct {
		CanViewOrder         bool   `json:"can_view_order"`
		CreatedAt            string `json:"created_at"`
		Dates                string `json:"dates"`
		FilesExpireAt        string `json:"files_expire_at"`
		ItemsCount           int    `json:"items_count"`
		LastTimeAt           string `json:"last_time_at"`
		MultiDay             bool   `json:"multi_day"`
		NeededPositionsCount int    `json:"needed_positions_count"`
		OtherTimeCount       int    `json:"other_time_count"`
		Permissions          string `json:"permissions"`
		PlanNotesCount       int    `json:"plan_notes_count"`
		PlanPeopleCount      int    `json:"plan_people_count"`
		PlanningCenterUrl    string `json:"planning_center_url"`
		PrefersOrderView     bool   `json:"prefers_order_view"`
		Public               bool   `json:"public"`
		PublicBySchedule     bool   `json:"public_by_schedule"`
		Rehearsable          bool   `json:"rehearsable"`
		RehearsalTimeCount   int    `json:"rehearsal_time_count"`
		RemindersDisabled    bool   `json:"reminders_disabled"`
		SeriesTitle          string `json:"series_title"`
		ServiceTimeCount     int    `json:"service_time_count"`
		ShortDates           string `json:"short_dates"`
		SortDate             string `json:"sort_date"`
		Title                string `json:"title"`
		TotalLength          int    `json:"total_length"`
		UpdatedAt            string `json:"updated_at"`
	} `json:"attributes"`
	Relationships struct {
		ServiceType             map[string]any `json:"service_type"`
		PreviousPlan            map[string]any `json:"previous_plan"`
		NextPlan                map[string]any `json:"next_plan"`
		Series                  map[string]any `json:"series"`
		CreatedBy               map[string]any `json:"created_by"`
		UpdatedBy               map[string]any `json:"updated_by"`
		LinkedPublishingEpisode map[string]any `json:"linked_publishing_episode"`
		AttachmentTypes         map[string]any `json:"attachment_types"`
		Contributors            map[string]any `json:"contributors"`
		MySchedules             map[string]any `json:"my_schedules"`
		PlanTimes               struct {
			Links map[string]any      `json:"links"`
			Data  []PlanTimesRelation `json:"data"`
		} `json:"plan_times"`
	} `json:"relationships"`
	Links map[string]any `json:"links"`
}

type FetchedPlanResponseType struct {
	Links    map[string]string `json:"links"`
	Data     []PlanRaw         `json:"data"`
	Included []any             `json:"included"`
	Meta     map[string]any    `json:"meta"`
}

func FetchPlanOfServiceTypeForUser(userId string, serviceTypeId string, app *pocketbase.PocketBase) ([]PlanRaw, error) {
	apiURL := "https://api.planningcenteronline.com/services/v2/service_types/" + serviceTypeId + "/plans?filter=future&include=plan_times"

	app.Logger().Info(
		"Fetching plans from a service type for this user.",
		"URL", apiURL,
		"userID", userId,
		"service_type_id", serviceTypeId,
	)

	resBody, err := SendAPICall(
		http.MethodGet,
		apiURL,
		nil,
		userId,
		app,
	)
	if err != nil {
		return []PlanRaw{}, err
	}

	responseJson := new(FetchedPlanResponseType)

	err = json.Unmarshal([]byte(resBody), &responseJson)

	if err != nil {
		return []PlanRaw{}, err
	}

	return responseJson.Data, nil
}
