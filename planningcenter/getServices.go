package planningcenter

import (
	"github.com/pocketbase/pocketbase"
)

// Service Type:
type PlanType struct {
	Id                   string      `json:"id"`
	Owner                string      `json:"owner"`
	ServiceType          string      `json:"service_type"`
	Dates                string      `json:"dates"`
	ItemsCount           int         `json:"items_count"`
	MultiDay             bool        `json:"multi_day"`
	NeededPositionsCount int         `json:"needed_positions_count"`
	OtherTimeCount       int         `json:"other_time_count"`
	PlanNotesCount       int         `json:"plan_notes_count"`
	PlanPeopleCount      int         `json:"plan_people_count"`
	PrefersOrderView     bool        `json:"prefers_order_view"`
	Public               bool        `json:"public"`
	PublicBySchedule     bool        `json:"public_by_schedule"`
	Rehearsable          bool        `json:"rehearsable"`
	RehearsalTimeCount   int         `json:"rehearsal_time_count"`
	RemindersDisabled    bool        `json:"reminders_disabled"`
	SeriesTitle          string      `json:"series_title"`
	ServiceTimeCount     int         `json:"service_time_count"`
	SortDate             string      `json:"sort_date"`
	Title                string      `json:"title"`
	TotalLength          int         `json:"total_length"`
	Items                []ItemsType `json:"items"`
}

func FetchFutureServices(userId string, app *pocketbase.PocketBase) error {
	// Fetch All the service types for the user
	serviceTypes, err := FetchAndSaveServiceTypesForUser(userId, app)
	if err != nil {
		return err
	}

	// Loop through each service type and get its plans
	// For each plan, we also have to fetch the plan items.

	allPlans := []PlanType{}
	for i := 0; i < len(serviceTypes); i++ {
		rawPlans, err := FetchPlanOfServiceTypeForUser(userId, serviceTypes[i].Id, app)
		if err != nil {
			app.Logger().Error(
				"Failed to fetch plans for service type",
				"userID", userId,
				"service_type_id", serviceTypes[i].Id,
				"err", err,
			)
			continue
		}
		for j := 0; j < len(rawPlans); j++ {
			planItems, err := FetchPlanItemsOfPlan(userId, serviceTypes[i].Id, rawPlans[j].Id, app)
			if err != nil {
				app.Logger().Error(
					"Failed to fetch plan items for service type",
					"userID", userId,
					"service_type_id", serviceTypes[i].Id,
					"plan_id", rawPlans[j].Id,
					"err", err,
				)
				continue
			}
			if len(planItems) > 0 {
				allPlans = append(allPlans, PlanType{
					Id:                   userId + rawPlans[j].Id,
					Owner:                userId,
					ServiceType:          userId + serviceTypes[i].Id,
					Dates:                rawPlans[j].Attributes.Dates,
					ItemsCount:           rawPlans[j].Attributes.ItemsCount,
					MultiDay:             rawPlans[j].Attributes.MultiDay,
					NeededPositionsCount: rawPlans[j].Attributes.NeededPositionsCount,
					OtherTimeCount:       rawPlans[j].Attributes.OtherTimeCount,
					PlanNotesCount:       rawPlans[j].Attributes.PlanNotesCount,
					PlanPeopleCount:      rawPlans[j].Attributes.PlanPeopleCount,
					PrefersOrderView:     rawPlans[j].Attributes.PrefersOrderView,
					Public:               rawPlans[j].Attributes.Public,
					PublicBySchedule:     rawPlans[j].Attributes.PublicBySchedule,
					Rehearsable:          rawPlans[j].Attributes.Rehearsable,
					RehearsalTimeCount:   rawPlans[j].Attributes.RehearsalTimeCount,
					RemindersDisabled:    rawPlans[j].Attributes.RemindersDisabled,
					SeriesTitle:          rawPlans[j].Attributes.SeriesTitle,
					ServiceTimeCount:     rawPlans[j].Attributes.ServiceTimeCount,
					SortDate:             rawPlans[j].Attributes.SortDate,
					Title:                rawPlans[j].Attributes.Title,
					TotalLength:          rawPlans[j].Attributes.TotalLength,
					Items:                planItems,
				})
			}
		}
	}

	err = SavePlans(userId, allPlans, app)
	if err != nil {
		return err
	}

	return nil
}
