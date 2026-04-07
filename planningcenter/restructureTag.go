package planningcenter

type TagAttributes struct {
	CreatedAt            string `json:"created_at"`
	UpdatedAt            string `json:"updated_at"`
	Position             any    `json:"position"`
	Name                 string `json:"name"`
	Color                string `json:"color"`
	ChurchCenterCategory bool   `json:"church_center_category"`
}

type Tag struct {
	Type       string         `json:"type"`
	Id         string         `json:"id"`
	Attributes TagAttributes  `json:"attributes"`
	Links      map[string]any `json:"links"`
}

func RestructureTag(included IncludedType) (Tag, bool) {
	createdAt, ok := included.Attributes["created_at"].(string)
	if !ok {
		return Tag{}, false
	}

	updatedAt, ok := included.Attributes["updated_at"].(string)
	if !ok {
		return Tag{}, false
	}

	position, ok := included.Attributes["position"]
	if !ok {
		return Tag{}, false
	}

	name, ok := included.Attributes["name"].(string)
	if !ok {
		return Tag{}, false
	}

	color, ok := included.Attributes["color"].(string)
	if !ok {
		return Tag{}, false
	}

	churchCenterCategory, ok := included.Attributes["church_center_category"].(bool)
	if !ok {
		return Tag{}, false
	}

	newEvent := Tag{
		Type: included.Type,
		Id:   included.Id,
		Attributes: TagAttributes{
			CreatedAt:            createdAt,
			UpdatedAt:            updatedAt,
			Position:             position,
			Name:                 name,
			Color:                color,
			ChurchCenterCategory: churchCenterCategory,
		},
	}

	return newEvent, true
}

func ParseTags(tagsRelationship TagsRelationship, userId string) []string {
	tags := []string{}

	for a := 0; a < len(tagsRelationship.Data); a++ {
		tags = append(tags, (userId + tagsRelationship.Data[a].Id))
		// for _, aTag := range allTags {
		// 	if tagsRelationship.Data[a].Id == aTag.Id {
		// 		tags = append(tags, EventTag{
		// 			Id:    aTag.Id,
		// 			Color: aTag.Attributes.Color,
		// 			Name:  aTag.Attributes.Name,
		// 		})
		// 	}
		// }
	}

	return tags
}
