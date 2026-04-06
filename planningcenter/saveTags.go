package planningcenter

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// This function gets passed in the tags array and gets put into the database tags table
func SaveTags(userId string, tags []Tag, app *pocketbase.PocketBase) {
	collection, err := app.FindCollectionByNameOrId("tags")
	if err != nil {
		app.Logger().Warn("Create the tags collection to save the tags data fetched from the planning center api!")
		return
	}

	currentTags, err := app.FindAllRecords("tags",
		dbx.NewExp("owner = {:ownerid}", dbx.Params{"ownerid": userId}),
	)

	if err != nil {
		app.Logger().Error(
			"Failed to fetch the users current tags!",
			"user id", userId,
			"error", err,
		)
		return
	}

	// delete all previous records to save space and remove duplicates.
	err = app.RunInTransaction(func(txApp core.App) error {
		for _, tag := range currentTags {
			err = txApp.Delete(tag)

			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		app.Logger().Error(
			"Failed to delete the users previous tags!",
			"user id", userId,
			"error", err,
		)
		return
	} else {
		app.Logger().Info(
			"Successfully deleted the users previous tags!",
			"user id", userId,
		)
	}

	for i := 0; i < len(tags); i++ {
		existingRecord, err := app.FindRecordById("tags", userId+tags[i].Id)

		if err != nil {
			newTagRecord := core.NewRecord(collection)
			newTagRecord.Set("id", userId+tags[i].Id)
			newTagRecord.Set("tag_id", tags[i].Id)
			newTagRecord.Set("owner", userId)
			newTagRecord.Set("name", tags[i].Attributes.Name)
			newTagRecord.Set("color", tags[i].Attributes.Color)

			if err := app.Save(newTagRecord); err != nil {
				app.Logger().Error(
					"Failed save a record to tags.",
					"id", userId,
					"tag", tags[i],
					"record", newTagRecord,
					"error", err,
				)
				continue
			}
		} else {
			existingRecord.Set("tag_id", tags[i].Id)
			existingRecord.Set("owner", userId)
			existingRecord.Set("name", tags[i].Attributes.Name)
			existingRecord.Set("color", tags[i].Attributes.Color)

			if err := app.Save(existingRecord); err != nil {
				app.Logger().Error(
					"Failed save a record to tags.",
					"id", userId,
					"resource", tags[i],
					"record", existingRecord,
					"error", err,
				)
				continue
			}
		}
	}
}
