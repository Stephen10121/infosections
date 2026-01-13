package enpoints

import (
	"github.com/Stephen10121/infosections/functions"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func UpdateSpecificUserEvents(se *core.ServeEvent, app *pocketbase.PocketBase) {
	se.Router.PATCH("/updateSpecificUserEvents/{id}", func(e *core.RequestEvent) error {
		id := e.Request.PathValue("id")
		authenticity := e.Request.Header.Get("X-PCO-Webhooks-Authenticity")

		if len(id) == 0 || len(authenticity) == 0 {
			return e.JSON(422, map[string]string{
				"msg": "Missing parameters",
			})
		}

		_, err := app.FindFirstRecordByFilter(
			"users",
			"id = {:id} && authToken = {:authToken}",
			dbx.Params{"id": id, "authToken": authenticity},
		)

		if err != nil {
			return e.JSON(404, map[string]string{
				"msg": "User Not Found!",
			})
		}

		functions.GetAndStoreNextThreeEvents(id, app)

		return e.JSON(200, map[string]string{
			"msg": "ok",
		})
	})
}
