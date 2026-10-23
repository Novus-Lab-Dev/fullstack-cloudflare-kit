import { eq, getTableColumns, sql, SQL, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { AnySQLiteColumn, AnySQLiteTable } from "drizzle-orm/sqlite-core";


export type D1Client = DrizzleD1Database;

export type TableRow<TTable extends AnySQLiteTable> = InferSelectModel<TTable>;

export type NewTableRow<TTable extends AnySQLiteTable> = InferInsertModel<TTable>;

export type PrimaryKeyValue = string | number;

export type SortValue = AnySQLiteColumn | SQL;

export type ColumnKey<TTable extends AnySQLiteTable> = Extract<keyof TableRow<TTable>, string>;

export type FindQuery<TTable extends AnySQLiteTable, TKey extends ColumnKey<TTable> = ColumnKey<TTable>> = {
    select?: readonly TKey[];
    where?: SQL;
    orderBy?: SortValue | SortValue[];
    limit?: number;
    skip?: number;
};

export type PaginationQuery<TTable extends AnySQLiteTable, TKey extends ColumnKey<TTable> = ColumnKey<TTable>> =
    Omit<FindQuery<TTable, TKey>, "skip"> & {
        page?: number;
    };

export type PaginatedResult<TRow> = {
    items: TRow[];
    total: number;
    page: number;
    limit: number;
};

export type ProjectedRow<TTable extends AnySQLiteTable, TKey extends ColumnKey<TTable>> = Pick<TableRow<TTable>, TKey>;

type ProjectedQuery = {
    limit(limit: number): ProjectedQuery;
    offset(offset: number): ProjectedQuery;
    get(): Promise<unknown>;
    all(): Promise<unknown[]>;
};

const FIRST_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export class BaseRepository<TTable extends AnySQLiteTable> {
    protected db: D1Client;
    protected table: TTable;
    protected primaryKey: AnySQLiteColumn;

    constructor(db: D1Client, table: TTable, primaryKey: AnySQLiteColumn) {
        this.db = db;
        this.table = table;
        this.primaryKey = primaryKey;
    }

    private fieldsFor<TKey extends ColumnKey<TTable>>(keys?: readonly TKey[]) {
        if (!keys || keys.length === 0) {
            return undefined;
        }

        const columns = getTableColumns(this.table) as Record<string, AnySQLiteColumn>;

        return Object.fromEntries(keys.map(key => {
            const column = columns[key];

            if (!column) {
                throw new Error(`Unknown column "${key}"`);
            }

            return [key, column];
        }));
    }

    private selectFiltered<TKey extends ColumnKey<TTable>>(query: FindQuery<TTable, TKey>): ProjectedQuery {
        const sortValues = query.orderBy === undefined
            ? []
            : Array.isArray(query.orderBy)
                ? query.orderBy
                : [query.orderBy];

        const fields = this.fieldsFor(query.select);
        const selection = fields ? this.db.select(fields) : this.db.select();

        return selection
            .from(this.table)
            .where(query.where)
            .orderBy(...sortValues) as unknown as ProjectedQuery;
    }

    async findOne<TKey extends ColumnKey<TTable> = ColumnKey<TTable>>(
        query: FindQuery<TTable, TKey> = {}
    ): Promise<ProjectedRow<TTable, TKey> | null> {
        const foundRow = await this.selectFiltered(query)
            .limit(query.limit ?? 1)
            .offset(query.skip ?? 0)
            .get();

        return (foundRow as ProjectedRow<TTable, TKey> | undefined) ?? null;
    }

    async findAll<TKey extends ColumnKey<TTable> = ColumnKey<TTable>>(
        query: FindQuery<TTable, TKey> = {}
    ): Promise<ProjectedRow<TTable, TKey>[]> {
        const filteredQuery = this.selectFiltered(query);

        const rows = query.limit === undefined
            ? await filteredQuery.all()
            : await filteredQuery.limit(query.limit).offset(query.skip ?? 0).all();

        return rows as ProjectedRow<TTable, TKey>[];
    }

    async findWithPagination<TKey extends ColumnKey<TTable> = ColumnKey<TTable>>(
        query: PaginationQuery<TTable, TKey> = {}
    ): Promise<PaginatedResult<ProjectedRow<TTable, TKey>>> {
        const page = Math.max(query.page ?? FIRST_PAGE, FIRST_PAGE);
        const limit = Math.max(query.limit ?? DEFAULT_PAGE_SIZE, 1);

        const [pageRows, countRow] = await Promise.all([
            this.selectFiltered(query).limit(limit).offset((page - FIRST_PAGE) * limit).all(),
            this.db.select({ total: sql<number>`count(*)` }).from(this.table).where(query.where).get(),
        ]);

        return {
            items: pageRows as ProjectedRow<TTable, TKey>[],
            total: Number(countRow?.total ?? 0),
            page,
            limit,
        };
    }

    async create(data: NewTableRow<TTable>): Promise<TableRow<TTable>> {
        const createdRow = (await this.db
            .insert(this.table)
            .values(data)
            .returning()
            .get()) as TableRow<TTable> | null;

        if (!createdRow) {
            throw new Error("Failed to create record");
        }

        return createdRow;
    }

    async update(id: PrimaryKeyValue, data: Partial<NewTableRow<TTable>>): Promise<TableRow<TTable> | null> {
        const updatedRow = (await this.db
            .update(this.table)
            .set(data)
            .where(eq(this.primaryKey, id))
            .returning()
            .get()) as TableRow<TTable> | null;

        return updatedRow ?? null;
    }

    async delete(id: PrimaryKeyValue): Promise<boolean> {
        const deleteResult = await this.db.delete(this.table).where(eq(this.primaryKey, id)).run();
        return (deleteResult?.meta?.changes ?? 0) > 0;
    }
}
