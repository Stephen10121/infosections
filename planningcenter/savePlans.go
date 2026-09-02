package planningcenter

import (
	"errors"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func SavePlans(userId string, plans []PlanType, app *pocketbase.PocketBase) error {
	collection, err := app.FindCollectionByNameOrId("plan")
	if err != nil {
		return errors.New("Create the plan collection to save the plan data fetched from the planning center api!")
	}

	currentPlans, err := app.FindAllRecords("plan",
		dbx.NewExp("owner = {:ownerid}", dbx.Params{"ownerid": userId}),
	)

	if err != nil {
		app.Logger().Error(
			"Failed to fetch the users current plans!",
			"user id", userId,
			"error", err,
		)
		return errors.New("Failed to fetch the users current plans!")
	}

	// delete all previous records to save space and remove duplicates.
	err = app.RunInTransaction(func(txApp core.App) error {
		for _, currentDlan := range currentPlans {
			err = txApp.Delete(currentDlan)

			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		app.Logger().Error(
			"Failed to delete the users previous plans!",
			"user id", userId,
			"error", err,
		)
		return errors.New("Failed to delete the users previous plans!")
	} else {
		app.Logger().Info(
			"Successfully deleted the users previous plans!",
			"user id", userId,
		)
	}

	for i := 0; i < len(plans); i++ {
		existingRecord, err := app.FindRecordById("plan", plans[i].Id)

		if err != nil {
			newPlanRecord := core.NewRecord(collection)
			newPlanRecord.Set("id", plans[i].Id)
			newPlanRecord.Set("owner", plans[i].Owner)
			newPlanRecord.Set("service_type", plans[i].ServiceType)
			newPlanRecord.Set("dates", plans[i].Dates)
			newPlanRecord.Set("items_count", plans[i].ItemsCount)
			newPlanRecord.Set("multi_day", plans[i].MultiDay)
			newPlanRecord.Set("needed_positions_count", plans[i].NeededPositionsCount)
			newPlanRecord.Set("other_time_count", plans[i].OtherTimeCount)
			newPlanRecord.Set("plan_notes_count", plans[i].PlanNotesCount)
			newPlanRecord.Set("plan_people_count", plans[i].PlanPeopleCount)
			newPlanRecord.Set("prefers_order_view", plans[i].PrefersOrderView)
			newPlanRecord.Set("public", plans[i].Public)
			newPlanRecord.Set("public_by_schedule", plans[i].PublicBySchedule)
			newPlanRecord.Set("rehearsable", plans[i].Rehearsable)
			newPlanRecord.Set("rehearsal_time_count", plans[i].RehearsalTimeCount)
			newPlanRecord.Set("reminders_disabled", plans[i].RemindersDisabled)
			newPlanRecord.Set("series_title", plans[i].SeriesTitle)
			newPlanRecord.Set("service_time_count", plans[i].ServiceTimeCount)
			newPlanRecord.Set("sort_date", plans[i].SortDate)
			newPlanRecord.Set("title", plans[i].Title)
			newPlanRecord.Set("total_length", plans[i].TotalLength)
			newPlanRecord.Set("items", plans[i].Items)

			if err := app.Save(newPlanRecord); err != nil {
				app.Logger().Error(
					"Failed save a record to plan.",
					"id", userId,
					"plan", plans[i],
					"record", newPlanRecord,
					"error", err,
				)
				continue
			}
		} else {
			existingRecord.Set("owner", plans[i].Owner)
			existingRecord.Set("service_type", plans[i].ServiceType)
			existingRecord.Set("dates", plans[i].Dates)
			existingRecord.Set("items_count", plans[i].ItemsCount)
			existingRecord.Set("multi_day", plans[i].MultiDay)
			existingRecord.Set("needed_positions_count", plans[i].NeededPositionsCount)
			existingRecord.Set("other_time_count", plans[i].OtherTimeCount)
			existingRecord.Set("plan_notes_count", plans[i].PlanNotesCount)
			existingRecord.Set("plan_people_count", plans[i].PlanPeopleCount)
			existingRecord.Set("prefers_order_view", plans[i].PrefersOrderView)
			existingRecord.Set("public", plans[i].Public)
			existingRecord.Set("public_by_schedule", plans[i].PublicBySchedule)
			existingRecord.Set("rehearsable", plans[i].Rehearsable)
			existingRecord.Set("rehearsal_time_count", plans[i].RehearsalTimeCount)
			existingRecord.Set("reminders_disabled", plans[i].RemindersDisabled)
			existingRecord.Set("series_title", plans[i].SeriesTitle)
			existingRecord.Set("service_time_count", plans[i].ServiceTimeCount)
			existingRecord.Set("sort_date", plans[i].SortDate)
			existingRecord.Set("title", plans[i].Title)
			existingRecord.Set("total_length", plans[i].TotalLength)
			existingRecord.Set("items", plans[i].Items)

			if err := app.Save(existingRecord); err != nil {
				app.Logger().Error(
					"Failed save a record to service types.",
					"id", userId,
					"plan", plans[i],
					"record", existingRecord,
					"error", err,
				)
				continue
			}
		}
	}
	return nil
}
