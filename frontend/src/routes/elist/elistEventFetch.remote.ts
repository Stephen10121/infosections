import { eventFieldRequirementsPublic, type EventDBModel } from "@/event.utils";
import { getRequestEvent, query } from "$app/server";
import { config } from "dotenv";
import * as v from "valibot";
import type { EventListDBModel } from "@/utils";

config();

export const getEventsForElist = query(v.string(), async (listId) => {
  const { locals } = getRequestEvent();

  let events: EventDBModel[] = [];
  let eventList: EventListDBModel;
  try {
    eventList = await locals.pb.collection("eventLists").getOne(listId, {
      headers: {
        Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!,
      },
    });
  } catch (err) {
    console.log("Event list not found.", err);
    return events;
  }

  const today = new Date();
  const now = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${(today.getDate() - 2).toString().padStart(2, "0")}`;

  try {
    let filter = `startTime > "${now}" && imageURL != ""`;

    // This filter shows all events for the testing dev feed.
    if (eventList.id !== "js44ym8zp9lfu3v") {
      filter += ` && owner = "${eventList.owner}"`;
    }

    if (eventList.filters.onlyShowFeatured) {
      filter += " && featured = true";
    }

    if (eventList.filters.hideUnpublished) {
      filter += " && visibleInChurchCenter = true";
    }

    events = await locals.pb.collection("events").getFullList({
      filter,
      sort: "startTime",
      fields: eventFieldRequirementsPublic,
      headers: {
        Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!,
      },
    });
  } catch (err) {
    console.log("Events not found.", err);
    return events;
  }

  return events;
});
