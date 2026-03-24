package planningcenter

import (
	"errors"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
)

// This function will go to the planning center api. If the access token has expired, the function will fetch a new one and retry the api call.
func SendAPICall(method string, endpointURL string, body io.Reader, userId string, app *pocketbase.PocketBase) ([]byte, error) {
	log.Println("Calling an api endpoint at planningcenter.")

	userRecord, err := app.FindRecordById("users", userId)
	if err != nil {
		return nil, errors.New("user doesnt exist.")
	}

	integration, err := app.FindFirstRecordByFilter(
		"integration",
		"owner = {:owner}",
		dbx.Params{"owner": userRecord.Id},
	)
	if err != nil {
		return nil, errors.New("user doesnt have planning center integration.")
	}

	// These next lines check if the current access token is valid or not. If not, we will fetch a new one.
	now := time.Now()
	accessTokenExpires := integration.GetDateTime("accessTokenExpires").Time()
	tokenExpired := accessTokenExpires.Sub(now).Seconds() < 10

	if tokenExpired {
		err = NewAccessToken(app, userId)
		if err != nil {
			return nil, err
		}

		integration, err = app.FindFirstRecordByFilter(
			"integration",
			"owner = {:owner}",
			dbx.Params{"owner": userRecord.Id},
		)
		if err != nil {
			return nil, errors.New("user doesnt have planning center integration.")
		}
	}

	req, err := http.NewRequest(
		method,
		endpointURL,
		body,
	)
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+integration.GetString("accessToken"))

	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	return io.ReadAll(res.Body)
}
