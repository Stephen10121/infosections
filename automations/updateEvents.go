package automations

import (
	"time"

	"github.com/Stephen10121/infosections/functions"
	"github.com/Stephen10121/infosections/planningcenter"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
)

// This function gets called every hour and it just fetches the events for any user that is subscribed.
func UpdateEventInstances(app *pocketbase.PocketBase) {
	app.Logger().Info("Updating the event instances for every subscribed user.")
	users, err := app.FindAllRecords("users")

	if err != nil {
		app.Logger().Error(
			"Failed to fetch all 'users' records",
			"error", err,
		)
		return
	}

	for i := 0; i < len(users); i++ {
		app.Logger().Info(
			"Fetching event data for user.",
			"user", users[i].GetString("name"),
		)
		functions.GetAndStoreNextThreeEvents(users[i].Id, app)
		planningcenter.FetchFutureServices(users[i].Id, app)

		integration, err := app.FindFirstRecordByFilter(
			"integration",
			"owner = {:owner}",
			dbx.Params{"owner": users[i].Id},
		)
		if err != nil {
			continue
		}

		integration.Set("lastEventsFetch", time.Now())

		err = app.Save(integration)
		if err != nil {
			continue
		}
	}
}
