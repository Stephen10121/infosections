package planningcenter

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

type ServiceTypeRaw struct {
	Type       string `json:"type"`
	Id         string `json:"id"`
	Attributes struct {
		ArchivedAt                 any    `json:"archived_at"`
		AttachmentTypesEnabled     bool   `json:"attachment_types_enabled"`
		BackgroundCheckPermissions string `json:"background_check_permissions"`
		CommentPermissions         string `json:"comment_permissions"`
		CreatedAt                  string `json:"created_at"`
		CustomItemTypes            []any  `json:"custom_item_types"`
		DeletedAt                  any    `json:"deleted_at"`
		Frequency                  string `json:"frequency"`
		LastPlanFrom               string `json:"last_plan_from"`
		Name                       string `json:"name"`
		Permissions                string `json:"permissions"`
		ScheduledPublish           bool   `json:"scheduled_publish"`
		Sequence                   int    `json:"sequence"`
		StandardItemTypes          []any  `json:"standard_item_types"`
		UpdatedAt                  string `json:"updated_at"`
	} `json:"attributes"`
	Relationships map[string]any `json:"relationships"`
	Links         map[string]any `json:"links"`
}

type FetchedServiceTypesResponseType struct {
	Links    map[string]string `json:"links"`
	Data     []ServiceTypeRaw  `json:"data"`
	Included []any             `json:"included"`
	Meta     map[string]any    `json:"meta"`
}

// This function will fetch all the service types for a given integration, remove old service types and save new ones. Also this function will return the new service types.
func FetchAndSaveServiceTypesForUser(userId string, app *pocketbase.PocketBase) ([]ServiceTypeRaw, error) {
	apiURL := "https://api.planningcenteronline.com/services/v2/service_types"

	app.Logger().Info(
		"Fetching service types for this user.",
		"URL", apiURL,
		"userID", userId,
	)

	resBody, err := SendAPICall(
		http.MethodGet,
		apiURL,
		nil,
		userId,
		app,
	)
	if err != nil {
		return []ServiceTypeRaw{}, err
	}

	responseJson := new(FetchedServiceTypesResponseType)

	err = json.Unmarshal([]byte(resBody), &responseJson)

	if err != nil {
		return []ServiceTypeRaw{}, err
	}

	err = SaveServiceTypes(userId, responseJson.Data, app)

	if err != nil {
		return []ServiceTypeRaw{}, err
	}

	return responseJson.Data, nil
}

// This function gets passed in the service types array and gets put into the database service_type table
func SaveServiceTypes(userId string, service_types []ServiceTypeRaw, app *pocketbase.PocketBase) error {
	collection, err := app.FindCollectionByNameOrId("service_type")
	if err != nil {
		return errors.New("Create the service_type collection to save the service_type data fetched from the planning center api!")
	}

	currentServiceTypes, err := app.FindAllRecords("service_type",
		dbx.NewExp("owner = {:ownerid}", dbx.Params{"ownerid": userId}),
	)

	if err != nil {
		app.Logger().Error(
			"Failed to fetch the users current service_types!",
			"user id", userId,
			"error", err,
		)
		return errors.New("Failed to fetch the users current service_types!")
	}

	// delete all previous records to save space and remove duplicates.
	err = app.RunInTransaction(func(txApp core.App) error {
		for _, serviceType := range currentServiceTypes {
			err = txApp.Delete(serviceType)

			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		app.Logger().Error(
			"Failed to delete the users previous service types!",
			"user id", userId,
			"error", err,
		)
		return errors.New("Failed to delete the users previous service types!")
	} else {
		app.Logger().Info(
			"Successfully deleted the users previous service types!",
			"user id", userId,
		)
	}

	for i := 0; i < len(service_types); i++ {
		existingRecord, err := app.FindRecordById("service_type", userId+service_types[i].Id)

		if err != nil {
			newServiceTypeRecord := core.NewRecord(collection)
			newServiceTypeRecord.Set("id", userId+service_types[i].Id)
			newServiceTypeRecord.Set("owner", userId)
			newServiceTypeRecord.Set("frequency", service_types[i].Attributes.Frequency)
			newServiceTypeRecord.Set("name", service_types[i].Attributes.Name)
			newServiceTypeRecord.Set("sequence", service_types[i].Attributes.Sequence)

			if err := app.Save(newServiceTypeRecord); err != nil {
				app.Logger().Error(
					"Failed save a record to service types.",
					"id", userId,
					"service_type", service_types[i],
					"record", newServiceTypeRecord,
					"error", err,
				)
				continue
			}
		} else {
			existingRecord.Set("owner", userId)
			existingRecord.Set("frequency", service_types[i].Attributes.Frequency)
			existingRecord.Set("name", service_types[i].Attributes.Name)
			existingRecord.Set("sequence", service_types[i].Attributes.Sequence)

			if err := app.Save(existingRecord); err != nil {
				app.Logger().Error(
					"Failed save a record to service types.",
					"id", userId,
					"service_type", service_types[i],
					"record", existingRecord,
					"error", err,
				)
				continue
			}
		}
	}
	return nil
}
