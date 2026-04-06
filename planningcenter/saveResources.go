package planningcenter

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// This function gets passed in the resources array and gets put into the database resources table
func SaveResources(userId string, resources []ResourceJsonType, app *pocketbase.PocketBase) {
	collection, err := app.FindCollectionByNameOrId("resources")
	if err != nil {
		app.Logger().Warn("Create the resources collection to save the resource data fetched from the planning center api!")
		return
	}

	currentResources, err := app.FindAllRecords("resources",
		dbx.NewExp("owner = {:ownerid}", dbx.Params{"ownerid": userId}),
	)

	if err != nil {
		app.Logger().Error(
			"Failed to fetch the users current resources!",
			"user id", userId,
			"error", err,
		)
		return
	}

	// delete all previous records to save space and remove duplicates.
	err = app.RunInTransaction(func(txApp core.App) error {
		for _, resource := range currentResources {
			err = txApp.Delete(resource)

			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		app.Logger().Error(
			"Failed to delete the users previous resources!",
			"user id", userId,
			"error", err,
		)
		return
	} else {
		app.Logger().Info(
			"Successfully deleted the users previous resources!",
			"user id", userId,
		)
	}

	for i := 0; i < len(resources); i++ {
		existingRecord, err := app.FindRecordById("resources", userId+resources[i].Id)

		if err != nil {
			newResourceRecord := core.NewRecord(collection)
			newResourceRecord.Set("id", userId+resources[i].Id)
			newResourceRecord.Set("resource_id", resources[i].Id)
			newResourceRecord.Set("owner", userId)
			newResourceRecord.Set("kind", resources[i].Attributes.Kind)
			newResourceRecord.Set("name", resources[i].Attributes.Name)
			newResourceRecord.Set("path_name", resources[i].Attributes.PathName)
			newResourceRecord.Set("description", resources[i].Attributes.Description)
			newResourceRecord.Set("quantity", resources[i].Attributes.Quantity)

			if err := app.Save(newResourceRecord); err != nil {
				app.Logger().Error(
					"Failed save a record to resources.",
					"id", userId,
					"resource", resources[i],
					"record", newResourceRecord,
					"error", err,
				)
				continue
			}
		} else {
			existingRecord.Set("resource_id", resources[i].Id)
			existingRecord.Set("owner", userId)
			existingRecord.Set("kind", resources[i].Attributes.Kind)
			existingRecord.Set("name", resources[i].Attributes.Name)
			existingRecord.Set("path_name", resources[i].Attributes.PathName)
			existingRecord.Set("description", resources[i].Attributes.Description)
			existingRecord.Set("quantity", resources[i].Attributes.Quantity)

			if err := app.Save(existingRecord); err != nil {
				app.Logger().Error(
					"Failed save a record to resources.",
					"id", userId,
					"resource", resources[i],
					"record", existingRecord,
					"error", err,
				)
				continue
			}
		}
	}
}
