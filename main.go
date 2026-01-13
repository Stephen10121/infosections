package main

import (
	"log"

	"github.com/Stephen10121/infosections/automations"
	"github.com/Stephen10121/infosections/enpoints"
	"github.com/Stephen10121/infosections/initializers"
	"github.com/Stephen10121/infosections/tests"
	"github.com/Stephen10121/infosections/webhooks"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	initializers.SetupEnv()
	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		enpoints.UserHasSubscribed(se, app)
		enpoints.NewUserLoggedIn(se, app)
		enpoints.UpdateSpecificUserEvents(se, app)
		webhooks.HandleWebhookEndpoint(se, app)

		tests.CreateWebhook(se, app)

		return se.Next()
	})

	// This function runs every hour. Its purpose is to refetch all the upcoming events for each user.
	app.Cron().MustAdd("updateEventInstancesForEachSubscribedUser", "0 */1 * * *", func() {
		automations.UpdateEventInstances(app)
	})

	log.Println("[server] InfoSections backend online.")
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
