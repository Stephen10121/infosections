package enpoints

import (
	"fmt"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func UpdateSpecificUserEvents(se *core.ServeEvent, app *pocketbase.PocketBase) {
	se.Router.POST("/updateSpecificUserEvents/{id}", func(e *core.RequestEvent) error {
		id := e.Request.PathValue("id")
		authenticity := e.Request.Header.Get("X-PCO-Webhooks-Authenticity")

		if len(id) == 0 || len(authenticity) == 0 {
			return e.JSON(422, map[string]string{
				"msg": "Missing parameters",
			})
		}

		fmt.Println(id, authenticity)
		// record, err := app.FindRecordById("webhooks", id)
		// if err != nil {
		// 	return e.JSON(401, map[string]string{
		// 		"msg": "Unauthorized!",
		// 	})
		// }

		// body, err := io.ReadAll(e.Request.Body)
		// if err != nil {
		// 	return e.JSON(422, map[string]string{
		// 		"msg": "Failed to read request body!",
		// 	})
		// }

		// isValidRequest := verifySignature(body, authenticity, record.GetString("authenticitySecret"))

		// if !isValidRequest {
		// 	return e.JSON(401, map[string]string{
		// 		"msg": "Invalid X-PCO-Webhooks-Authenticity!",
		// 	})
		// }

		// if !record.GetBool("active") {
		// 	return e.JSON(200, map[string]string{
		// 		"msg": "All good but the user has disabled this webhook.",
		// 	})
		// }

		// fmt.Println("A webhook just got invoked.", string(body))

		return e.JSON(200, map[string]string{
			"msg": "ok",
		})
	})
}
