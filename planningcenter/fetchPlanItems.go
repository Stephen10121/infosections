package planningcenter

import (
	"encoding/json"
	"net/http"

	"github.com/pocketbase/pocketbase"
)

type ItemsType struct {
	Description     string `json:"description"`
	ItemType        string `json:"item_type"`
	KeyName         string `json:"key_name"`
	Length          int    `json:"length"`
	Sequence        int    `json:"sequence"`
	ServicePosition string `json:"service_position"`
	Title           string `json:"title"`
}

type PlanItemsRaw struct {
	Type       string `json:"type"`
	Id         string `json:"id"`
	Attributes struct {
		CreatedAt                      string `json:"created_at"`
		CustomArrangementSequence      []any  `json:"custom_arrangement_sequence"`
		CustomArrangementSequenceFull  []any  `json:"custom_arrangement_sequence_full"`
		CustomArrangementSequenceShort []any  `json:"custom_arrangement_sequence_short"`
		Description                    string `json:"description"`
		HtmlDetails                    string `json:"html_details"`
		ItemType                       string `json:"item_type"`
		KeyName                        string `json:"key_name"`
		Length                         int    `json:"length"`
		Sequence                       int    `json:"sequence"`
		ServicePosition                string `json:"service_position"`
		Title                          string `json:"title"`
		UpdatedAt                      string `json:"updated_at"`
	} `json:"attributes"`
	Relationships map[string]any `json:"relationships"`
	Links         map[string]any `json:"links"`
}

type FetchedPlanItemsResponseType struct {
	Links    map[string]string `json:"links"`
	Data     []PlanItemsRaw    `json:"data"`
	Included []any             `json:"included"`
	Meta     map[string]any    `json:"meta"`
}

func FetchPlanItemsOfPlan(userId string, serviceTypeId string, planId string, app *pocketbase.PocketBase) ([]ItemsType, error) {
	apiURL := "https://api.planningcenteronline.com/services/v2/service_types/" + serviceTypeId + "/plans/" + planId + "/items?include=arrangement,item_assignments,item_notes,item_times,key,media,selected_attachment,song"

	app.Logger().Info(
		"Fetching plan items from a plan from service type for this user.",
		"URL", apiURL,
		"userID", userId,
		"service_type_id", serviceTypeId,
		"plan_id", planId,
	)

	resBody, err := SendAPICall(
		http.MethodGet,
		apiURL,
		nil,
		userId,
		app,
	)
	if err != nil {
		return []ItemsType{}, err
	}

	responseJson := new(FetchedPlanItemsResponseType)

	err = json.Unmarshal([]byte(resBody), &responseJson)

	if err != nil {
		return []ItemsType{}, err
	}

	planItems := []ItemsType{}

	for i := 0; i < len(responseJson.Data); i++ {
		planItems = append(planItems, ItemsType{
			Description:     responseJson.Data[i].Attributes.Description,
			ItemType:        responseJson.Data[i].Attributes.ItemType,
			KeyName:         responseJson.Data[i].Attributes.KeyName,
			Length:          responseJson.Data[i].Attributes.Length,
			Sequence:        responseJson.Data[i].Attributes.Sequence,
			ServicePosition: responseJson.Data[i].Attributes.ServicePosition,
			Title:           responseJson.Data[i].Attributes.Title,
		})
	}

	return planItems, nil
}
