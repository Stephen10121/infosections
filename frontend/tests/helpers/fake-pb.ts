/**
 * In-memory fake of the PocketBase client (`locals.pb`).
 *
 * Supports the subset of the API the remote functions use:
 *   collection(name).getFullList / getOne / getFirstListItem / create / update / delete
 *   createBatch() ... send()            (used by backend.remote dynamic-url resets)
 *   files.getURL(record, name)
 *
 * `getFirstListItem` matches simple `key="value"` equality filters (the code
 * base only uses those for first-item lookups), while `getFullList` returns
 * every seeded record (filter composition is covered by the event.utils tests).
 */
export type PBRecord = any;

export class FakePB {
	private store = new Map<string, Record<string, PBRecord>>();
	private pendingBatch: { collection: string; id: string; data: Partial<PBRecord> }[] = [];

	/** When true, the next `collection(name).delete(...)` call throws (simulates a backend failure). */
	failNextDelete = false;

	/** Seed `items` into `collection`. Items without an `id` get a generated one. */
	seed(collection: string, items: PBRecord[]): void {
		const col = this.store.get(collection) ?? {};
		for (const item of items) {
			const id = typeof item.id === "string" ? item.id : crypto.randomUUID();
			col[id] = { ...item, id };
		}
		this.store.set(collection, col);
	}

	collection(name: string) {
		const getCol = (): Record<string, PBRecord> => this.store.get(name) ?? {};

		return {
			getFullList: async () => {
				const col = getCol();
				return Object.values(col).map((rec) => ({ ...rec }));
			},

			getOne: async (id: string) => {
				const rec = getCol()[id];
				if (!rec) throw new Error(`FakePB: record '${id}' not found in '${name}'`);
				return { ...rec };
			},

			getFirstListItem: async (filter: string) => {
				const conditions = extractFilterConditions(filter);
				const match = (rec: PBRecord) =>
					conditions.every(([key, value]) => String(rec[key] ?? "") === value);

				const found = Object.values(getCol()).find(match);
				if (!found) {
					throw new Error(`FakePB: no record in '${name}' matches '${filter}'`);
				}
				return { ...found };
			},

			create: async (data: any) => {
				const col = getCol();
				const id = typeof data["id"] === "string" ? data["id"] : crypto.randomUUID();
				const record = { ...data, id };
				col[id] = record;
				this.store.set(name, col);
				return { ...record };
			},

			update: async (id: string, data: Partial<PBRecord>) => {
				const col = getCol();
				if (!col[id]) throw new Error(`FakePB: record '${id}' not found in '${name}'`);
				col[id] = { ...col[id], ...data };
				this.store.set(name, col);
				return { ...col[id] };
			},

			delete: async (id: string) => {
				if (this.failNextDelete) {
					this.failNextDelete = false;
					throw new Error(`FakePB: delete failed for '${id}' in '${name}' (simulated)`);
				}
				const col = getCol();
				if (!col[id]) throw new Error(`FakePB: record '${id}' not found in '${name}'`);
				delete col[id];
				this.store.set(name, col);
			}
		};
	}

	createBatch() {
		return {
			collection: (name: string) => ({
				update: (id: string, data: Partial<PBRecord>) => {
					this.pendingBatch.push({ collection: name, id, data });
				}
			}),
			send: async () => {
				const batch = this.pendingBatch;
				this.pendingBatch = [];
				for (const { collection, id, data } of batch) {
					await this.collection(collection).update(id, data);
				}
			}
		};
	}

	readonly files = {
		getURL: (_record: PBRecord, name: string) => `https://fake.files/${name}`
	};
}

/** Extracts `key="value"` equality conditions from a PocketBase filter string. */
function extractFilterConditions(filter: string): [string, string][] {
	const conditions: [string, string][] = [];
	const re = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"([^"]*)"/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(filter))) {
		conditions.push([match[1]!, match[2]!]);
	}
	return conditions;
}
