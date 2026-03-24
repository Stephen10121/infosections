package planningcenter

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/Stephen10121/infosections/initializers"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
)

type NewAuthTokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
	CreatedAt    int    `json:"created_at"`
}

// This function will go fetch a new access token. Once it recieves the token, it'll be added to the database right away.
func NewAccessToken(base *pocketbase.PocketBase, userId string) error {
	log.Println("Fetching a new access token!")
	userRecord, err := base.FindRecordById("users", userId)
	if err != nil {
		return errors.New("user doesnt exist")
	}

	integration, err := base.FindFirstRecordByFilter(
		"integration",
		"owner = {:owner}",
		dbx.Params{"owner": userRecord.Id},
	)
	if err != nil {
		return errors.New("user doesnt have planning center integration.")
	}

	data := map[string]string{
		"client_id":     initializers.PlanningCenterClientId,
		"client_secret": initializers.PlanningCenterClientSecret,
		"refresh_token": integration.GetString("refreshToken"),
		"grant_type":    "refresh_token",
	}

	// Marshal the JSON data
	jsonData, err := json.Marshal(data)
	if err != nil {
		return errors.New("failed to jsonify the request body")
	}

	req, err := http.NewRequest(
		http.MethodPost,
		"https://api.planningcenteronline.com/oauth/token",
		bytes.NewBuffer(jsonData),
	)
	req.Header.Add("Content-Type", "application/json")

	if err != nil {
		return errors.New("failed to create the http request")
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return errors.New("failed to send the http request")
	}

	resBody, err := io.ReadAll(res.Body)
	if err != nil {
		return errors.New("failed to read the http response body")
	}

	bodyStruct := NewAuthTokenResponse{}
	err = json.Unmarshal(resBody, &bodyStruct)
	if err != nil {
		return errors.New("failed to put http response body into a struct")
	}

	if len(bodyStruct.AccessToken) == 0 || len(bodyStruct.RefreshToken) == 0 {
		return errors.New("failed access the tokens from the struct")
	}

	date := time.Now()
	refreshTokenExpires := date.AddDate(0, 0, 89)
	accessTokenExpires := date.Add(time.Duration(bodyStruct.ExpiresIn) * time.Second)

	integration.Set("refreshToken", bodyStruct.RefreshToken)
	integration.Set("accessToken", bodyStruct.AccessToken)
	integration.Set("refreshTokenExpires", refreshTokenExpires)
	integration.Set("accessTokenExpires", accessTokenExpires)

	err = base.Save(integration)
	if err != nil {
		return err
	}

	return nil
}
