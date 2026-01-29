package planningcenter

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/pocketbase/pocketbase"
)

func str(num int) string {
	return strconv.Itoa(num)
}

func GetIncludedStructs(included []IncludedType) ([]EventItself, []EventTime, []ResourceBooking, []Tag) {
	eventsitself := []EventItself{}
	eventtimes := []EventTime{}
	resourceBookings := []ResourceBooking{}
	tags := []Tag{}

	for _, aType := range included {
		switch aType.Type {
		case "Event":
			newEvent, ok := RestructureEvent(aType)
			if !ok {
				continue
			}
			eventsitself = append(eventsitself, newEvent)
		case "EventTime":
			newEventTime, ok := RestructureEventTime(aType)
			if !ok {
				continue
			}
			eventtimes = append(eventtimes, newEventTime)
		case "ResourceBooking":
			newResourceBooking, ok := RestructureResourceBooking(aType)
			if !ok {
				continue
			}
			resourceBookings = append(resourceBookings, newResourceBooking)
		case "Tag":
			newTags, ok := RestructureTag(aType)
			if !ok {
				continue
			}
			tags = append(tags, newTags)
		default:
			continue
		}
	}

	return eventsitself, eventtimes, resourceBookings, tags
}

func EventFetcher(userId string, app *pocketbase.PocketBase) ([]Event, error) {
	year, month, day := time.Now().Add(-144 * time.Hour).Date()

	resBody, err := SendAPICall(
		http.MethodGet,
		"https://api.planningcenteronline.com/calendar/v2/event_instances?include=event%2Cevent_times%2Cresource_bookings%2Ctags&order=starts_at&per_page=100&where[starts_at][gt]="+str(year)+"-"+str(int(month))+"-"+str(day),
		nil,
		userId,
		app,
	)
	if err != nil {
		return []Event{}, err
	}

	responseJson := new(NewEventInstancesResponseType)

	err = json.Unmarshal([]byte(resBody), &responseJson)

	if err != nil {
		return []Event{}, err
	}

	events, eventTimes, resourceBookings, allTags := GetIncludedStructs(responseJson.Included)

	resources, err := FetchResources(userId, app)

	if err != nil {
		app.Logger().Error(
			"Failed to fetch resources",
			"id", userId,
			"error", err,
		)
		return []Event{}, err
	}

	var fetchedEvents []Event

	for i := 0; i < len(responseJson.Data); i++ {
		eventTime := ParseEventTimes(responseJson.Data[i].Relationships.EventTimes, eventTimes)
		resources := ParseResourceBookings(responseJson.Data[i].Relationships.ResourceBookings, resourceBookings, resources)
		tags := ParseTags(responseJson.Data[i].Relationships.Tags, allTags)
		eventItself, ok := ParseEventItself(responseJson.Data[i].Relationships.Event, events)
		if !ok {
			fmt.Println("No actuall event found for this event instance:", responseJson.Data[i].Id)
			continue
		}

		imageURL := eventItself.ImageUrl

		if len(responseJson.Data[i].Attributes.ImageUrl) > 0 {
			imageURL = responseJson.Data[i].Attributes.ImageUrl
		}

		fetchedEvents = append(fetchedEvents, Event{
			RecEventId:           responseJson.Data[i].Relationships.Event.Data.Id,
			InstanceId:           responseJson.Data[i].Id,
			StartTime:            responseJson.Data[i].Attributes.StartsAt,
			EndTime:              eventTime[len(eventTime)-1].EndTime,
			Name:                 eventItself.Name,
			Location:             responseJson.Data[i].Attributes.Location,
			Times:                eventTime,
			Resources:            resources,
			Tags:                 tags,
			Description:          eventItself.Summary,
			Recurrence:           responseJson.Data[i].Attributes.Recurrence,
			ImageURL:             imageURL,
			Featured:             eventItself.Featured,
			VisibleInChuchCenter: eventItself.VisibleInChuchCenter,
			RegistrationURL:      eventItself.RegistrationURL,
		})
	}

	return fetchedEvents, nil
}
