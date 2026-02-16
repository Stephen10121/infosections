import type { DynamicURLModel, URLRefHits, WeekSheetTimeSlot } from "@/utils.js";
import { error, json, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import { Temporal } from "temporal-polyfill";

config();

//This function records the ref data after we redirect the user as to not waste their time.
async function recordRefHit(url: URL, record: DynamicURLModel, locals: App.Locals) {
    setTimeout(async () => {
        let ref = url.searchParams.get("ref");
        if (!ref || ref.length === 0) return;

        let newRef: URLRefHits[] = [];
        let refFound = false;

        for (let i=0;i<record.refs.length;i++) {
            let currentRef = record.refs[i];
            if (ref !== currentRef.name) {
                newRef.push(currentRef);
            } else {
                newRef.push({
                    name: ref,
                    hits: currentRef.hits + 1
                });
                refFound = true;
            }

        }

        if (!refFound) {
            newRef.push({
                name: ref,
                hits: 1
            });
        }

        try {
            await locals.pb.collection('dynamic_url').update(record.id, {
                refs: newRef,
            }, {
                headers: {
                    "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
                }
            });
        } catch (err) {
            console.log("Failed to update ref for dynamic url: ", err);
        }
    }, 1);
}

export async function GET({ params, locals, url }) {
    const goID = params.slug;

    let record: DynamicURLModel;
    try {
        record = await locals.pb.collection('dynamic_url').getOne(goID, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (_err) {
        return error(404, "Dynamic Link not found.");
    }

    // The url has been disabled by the owner.
    if (record.disableURL) {
        return error(404, "Dynamic Link not found.");
    }

    let linkToRedirect = record.defaultRedirectTo;

    // If the dynamic_url owner enabled the override switch, we dont need to worry about anything else and just return the override URL
    if (record.enableOverrideRedirect) {
        linkToRedirect = record.overrideRedirectTo;
    } else if (record.enableWeekSheet) {
        let today = Temporal.Now.zonedDateTimeISO(record.timeZone);
    
        const todaysTimeSheet = record.weekSheet[today.dayOfWeek - 1];
        const currentMinute = today.hour * 60 + today.minute;
    
        let currentTimeSheet: WeekSheetTimeSlot | null = null;
    
        for (let i=0;i<todaysTimeSheet.length;i++) {
            let thisTimeSheet = todaysTimeSheet[i];
            if (thisTimeSheet.startMinute <= currentMinute && currentMinute <= thisTimeSheet.endMinute) {
                currentTimeSheet = thisTimeSheet;
            }
        }
    
        if (currentTimeSheet) {
            linkToRedirect = currentTimeSheet.link;
        }
    }

    recordRefHit(url, record, locals);
    // return json({
    //     linkToRedirect,
    // });
    return redirect(307, linkToRedirect);
}