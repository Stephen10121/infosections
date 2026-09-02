package planningcenter

import (
	"fmt"

	"github.com/pocketbase/pocketbase"
)

// Service Type:
type ServiceType struct {
	Id        string `json:"id"`
	Owner     string `json:"owner"`
	Frequency string `json:"frequency"`
	Name      string `json:"name"`
	Sequence  int    `json:"sequence"`
}

func FetchFutureServices(userId string, app *pocketbase.PocketBase) error {
	// Fetch All the service types for the user
	serviceTypes, err := FetchAndSaveServiceTypesForUser(userId, app)

	if err != nil {
		return err
	}

	for i := 0; i < len(serviceTypes); i++ {
		fmt.Println(serviceTypes[i].Attributes.Name)
	}

	return nil
	// Loop through each service type and get its plans
	// For each plan, we also have to fetch the plan items.
}
