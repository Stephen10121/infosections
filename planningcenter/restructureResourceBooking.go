package planningcenter

type ResourceBookingAttributes struct {
	CreatedAt string `json:"created_at"`
	EndsAt    string `json:"ends_at"`
	Quantity  int    `json:"quantity"`
	StartsAt  string `json:"starts_at"`
	UpdatedAt string `json:"updated_at"`
}

type ResourceBookingRelationshipsResourceData struct {
	Type string `json:"type"`
	Id   string `json:"id"`
}

type ResourceBookingRelationshipsResource struct {
	Data ResourceBookingRelationshipsResourceData `json:"data"`
}

type ResourceBookingRelationships struct {
	Resource ResourceBookingRelationshipsResource `json:"resource"`
}

type ResourceBooking struct {
	Type          string                       `json:"type"`
	Id            string                       `json:"id"`
	Attributes    ResourceBookingAttributes    `json:"attributes"`
	Relationships ResourceBookingRelationships `json:"relationships"`
}

func RestructureResourceBooking(included IncludedType) (ResourceBooking, bool) {
	createdAt, ok := included.Attributes["created_at"].(string)
	if !ok {
		return ResourceBooking{}, false
	}

	endsAt, ok := included.Attributes["ends_at"].(string)
	if !ok {
		return ResourceBooking{}, false
	}

	quantity, ok := included.Attributes["quantity"].(float64)
	if !ok {
		return ResourceBooking{}, false
	}

	startsAt, ok := included.Attributes["starts_at"].(string)
	if !ok {
		return ResourceBooking{}, false
	}

	updatedAt, ok := included.Attributes["updated_at"].(string)
	if !ok {
		return ResourceBooking{}, false
	}

	resource, ok := included.Relationships["resource"].(map[string]any)
	if !ok {
		return ResourceBooking{}, false
	}

	resourceData, ok := resource["data"].(map[string]any)
	if !ok {
		return ResourceBooking{}, false
	}

	resourceId, ok := resourceData["id"].(string)
	if !ok {
		return ResourceBooking{}, false
	}

	resourceType, ok := resourceData["type"].(string)
	if !ok {
		return ResourceBooking{}, false
	}

	newEvent := ResourceBooking{
		Type: included.Type,
		Id:   included.Id,
		Attributes: ResourceBookingAttributes{
			CreatedAt: createdAt,
			EndsAt:    endsAt,
			Quantity:  int(quantity),
			StartsAt:  startsAt,
			UpdatedAt: updatedAt,
		},
		Relationships: ResourceBookingRelationships{
			Resource: ResourceBookingRelationshipsResource{
				Data: ResourceBookingRelationshipsResourceData{
					Type: resourceType,
					Id:   resourceId,
				},
			},
		},
	}

	return newEvent, true
}

func ParseResourceBookings(resourcesRelation ResourceBookingsRelationship, resouceBookings []ResourceBooking, userId string) []string {
	resources := []string{}

	for _, relation := range resourcesRelation.Data {
		for _, resourceBooking := range resouceBookings {
			if relation.Id == resourceBooking.Id {
				resources = append(resources, (userId + resourceBooking.Relationships.Resource.Data.Id))
				// for _, resource := range resourcesMap {
				// 	if resource.Id == resourceBooking.Relationships.Resource.Data.Id {
				// 		resources = append(resources, Resource{
				// 			Id:       resourceBooking.Relationships.Resource.Data.Id,
				// 			Name:     resource.Attributes.Name,
				// 			PathName: resource.Attributes.PathName,
				// 			Kind:     resource.Attributes.Kind,
				// 		})
				// 		break
				// 	}
				// }
				break
			}
		}
	}

	return resources
}
