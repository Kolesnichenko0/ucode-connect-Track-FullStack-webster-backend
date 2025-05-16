// src/common/pagination/base.repository.ts
// import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
// import {
//     BaseCursor,
//     CursorConfig,
//     CursorPaginationResult,
// } from '../types/cursor.pagination.types';
//
// export class BaseRepository<T extends ObjectLiteral> { //TODO: added something in BaseRepository and changed to Prisma
//     protected readonly repo: Repository<T>;
//
//     constructor(repo: Repository<T>) {
//         this.repo = repo;
//     }
//
//     // Offset-based pagination
//     async paginateOffset(
//         queryBuilder: SelectQueryBuilder<T>,
//         page: number,
//         limit: number,
//     ): Promise<{ items: T[]; total: number }> {
//         const offset = (page - 1) * limit;
//         const total = await queryBuilder.getCount();
//         const items = await queryBuilder.skip(offset).take(limit).getMany();
//         return { items, total };
//     }
//
//     async paginateCursor<C extends BaseCursor>(
//         queryBuilder: SelectQueryBuilder<T>,
//         after: C | null,
//         limit: number,
//         cursorConfig: CursorConfig<T, C>,
//     ): Promise<CursorPaginationResult<T, C>> {
//         const { debug = false } = cursorConfig;
//
//         if (debug) {
//             console.log('BEFORE CURSOR - Raw SQL:', queryBuilder.getSql());
//             console.log(
//                 'BEFORE CURSOR - Parameters:',
//                 queryBuilder.getParameters(),
//             );
//         }
//
//         const countQuery = queryBuilder.clone();
//         const totalCount = await countQuery.getCount();
//
//         if (debug) {
//             console.log('Total count without cursor:', totalCount);
//         }
//
//         let remainingCount = totalCount;
//
//         if (after) {
//             this.applyCursorCondition(queryBuilder, after, cursorConfig);
//
//             if (debug) {
//                 console.log('AFTER CURSOR - Raw SQL:', queryBuilder.getSql());
//                 console.log(
//                     'AFTER CURSOR - Parameters:',
//                     queryBuilder.getParameters(),
//                 );
//
//                 // Check if records with this cursor will be found
//                 const checkQuery = queryBuilder.clone();
//                 const checkCount = await checkQuery.getCount();
//                 console.log(
//                     `Records that match cursor conditions: ${checkCount}`,
//                 );
//             }
//
//             // Get the number of remaining records after applying the cursor
//             const remainingQuery = queryBuilder.clone();
//             remainingCount = await remainingQuery.getCount();
//         }
//
//         queryBuilder.take(limit + 1);
//
//         const items = await queryBuilder.getMany();
//
//         if (debug) {
//             console.log(`Actually found ${items.length} items`);
//             if (items.length > 0) {
//                 console.log('First item:', items[0]);
//                 console.log('Last item:', items[items.length - 1]);
//             }
//         }
//
//         const hasMore = items.length > limit;
//
//         if (hasMore) {
//             items.pop();
//         }
//
//         const nextCursor = this.buildNextCursor<C>(items, cursorConfig);
//
//         if (debug && nextCursor) {
//             console.log('Generated nextCursor:', nextCursor);
//         }
//
//         const remaining = Math.max(0, remainingCount - limit);
//
//         return {
//             items,
//             nextCursor,
//             hasMore,
//             total: totalCount,
//             remaining,
//         };
//     }
//
//     private applyCursorCondition<C extends BaseCursor>(
//         queryBuilder: SelectQueryBuilder<T>,
//         after: C,
//         config: CursorConfig<T, C>,
//     ): void {
//         if (config.customConditionBuilder) {
//             const { conditions, parameters } = config.customConditionBuilder(
//                 after,
//                 config,
//             );
//             queryBuilder.andWhere(conditions, parameters);
//             return;
//         }
//
//         const fields = config.cursorFields;
//         if (fields.length === 0) return;
//
//         // Collect all possible combinations of conditions for cursor pagination
//         const { whereClause, parameters } = this.buildCursorWhereClause(
//             after,
//             config,
//         );
//
//         queryBuilder.andWhere(whereClause, parameters);
//     }
//
//     private buildCursorWhereClause<C extends BaseCursor>(
//         after: C,
//         config: CursorConfig<T, C>,
//     ): { whereClause: string; parameters: Record<string, any> } {
//         const fields = config.cursorFields;
//         const parameters: Record<string, any> = {};
//         const conditions: string[] = [];
//
//         // Treat each position as a separate "level" of conditions
//         for (let i = 0; i < fields.length; i++) {
//             const currentField = fields[i];
//             const currentAlias = config.entityAliases[currentField];
//             const currentDirection =
//                 config.sortDirections?.[currentField] || 'ASC';
//             const currentOperator = currentDirection === 'DESC' ? '<' : '>';
//
//             const levelConditions: string[] = [];
//
//             // For all previous fields we add an equality condition
//             for (let j = 0; j < i; j++) {
//                 const prevField = fields[j];
//                 const prevAlias = config.entityAliases[prevField];
//                 const equalParam = `${String(prevField)}_eq_${i}`;
//
//                 levelConditions.push(
//                     `${prevAlias}.${String(prevField)} = :${equalParam}`,
//                 );
//                 parameters[equalParam] = this.getTypedValue(
//                     after[prevField],
//                     config.fieldTypes?.[prevField],
//                 );
//             }
//
//             // Add a comparison condition for the current field
//             const compareParam = `${String(currentField)}_${i}`;
//             levelConditions.push(
//                 `${currentAlias}.${String(currentField)} ${currentOperator} :${compareParam}`,
//             );
//             parameters[compareParam] = this.getTypedValue(
//                 after[currentField],
//                 config.fieldTypes?.[currentField],
//             );
//
//             conditions.push(`(${levelConditions.join(' AND ')})`);
//         }
//
//         return {
//             whereClause: `(${conditions.join(' OR ')})`,
//             parameters,
//         };
//     }
//
//     private getTypedValue(
//         value: any,
//         type?: 'date' | 'number' | 'string',
//     ): any {
//         if (value === null || value === undefined) {
//             return value;
//         }
//
//         switch (type) {
//             case 'date':
//                 return typeof value === 'string' ? new Date(value) : value;
//             case 'number':
//                 return typeof value === 'string' ? Number(value) : value;
//             case 'string':
//                 return String(value);
//             default:
//                 return value;
//         }
//     }
//
//     private buildNextCursor<C extends BaseCursor>(
//         items: T[],
//         config: CursorConfig<T, C>,
//     ): C | null {
//         if (items.length === 0) {
//             return null;
//         }
//
//         const lastItem = items[items.length - 1];
//         const nextCursor = {} as C;
//
//         for (const field of config.cursorFields) {
//             if (config.getFieldValue) {
//                 nextCursor[field] = config.getFieldValue(lastItem, field);
//             } else {
//                 const fieldPath = String(field).split('.');
//                 let value: any = lastItem;
//
//                 for (const segment of fieldPath) {
//                     if (value && value[segment] !== undefined) {
//                         value = value[segment];
//                     } else {
//                         value = null;
//                         break;
//                     }
//                 }
//
//                 nextCursor[field] = value;
//             }
//         }
//
//         return nextCursor;
//     }
// }

// src/common/base.repository.ts
import { DatabaseService } from '../../core/db/database.service';
import {
    BaseCursor,
    CursorConfig,
    CursorPaginationResult,
} from '../../common/pagination/cursor';

export class PaginationBaseRepository<T> {
    protected readonly db: DatabaseService;

    constructor(db: DatabaseService) {
        this.db = db;
    }

    // Offset-based pagination
    async paginateOffset<Model extends keyof DatabaseService>(
        model: Model,
        query: any,
        page: number,
        limit: number,
    ): Promise<{ items: T[]; total: number }> {
        const skip = (page - 1) * limit;

        // Get total count
        const total = await (this.db[model] as any).count({
            where: query.where,
        });

        // Get paginated items
        const items = (await (this.db[model] as any).findMany({
            ...query,
            skip,
            take: limit,
        })) as T[];

        return { items, total };
    }

    async paginateCursor<
        C extends BaseCursor,
        Model extends keyof DatabaseService,
    >(
        model: Model,
        query: any,
        after: C | null,
        limit: number,
        cursorConfig: CursorConfig<T, C>,
    ): Promise<CursorPaginationResult<T, C>> {
        const { debug = false } = cursorConfig;

        if (debug) {
            console.log(
                'BEFORE CURSOR - Query:',
                JSON.stringify(query, null, 2),
            );
        }

        // Get total count without cursor
        const totalCount = await (this.db[model] as any).count({
            where: query.where,
        });

        if (debug) {
            console.log('Total count without cursor:', totalCount);
        }

        let remainingCount = totalCount;

        // Apply cursor conditions if after is provided
        if (after) {
            const cursorConditions = this.buildPrismaCursorConditions(
                after,
                cursorConfig,
            );

            // Merge cursor conditions with existing query
            query = this.mergeQueries(query, cursorConditions);

            if (debug) {
                console.log(
                    'AFTER CURSOR - Query:',
                    JSON.stringify(query, null, 2),
                );

                // Check if records with this cursor will be found
                const checkCount = await (this.db[model] as any).count({
                    where: query.where,
                });
                console.log(
                    `Records that match cursor conditions: ${checkCount}`,
                );
            }

            // Get the number of remaining records after applying the cursor
            remainingCount = await (this.db[model] as any).count({
                where: query.where,
            });
        }

        // Get items with pagination
        const items = (await (this.db[model] as any).findMany({
            ...query,
            take: limit + 1,
        })) as T[];

        if (debug) {
            console.log(`Actually found ${items.length} items`);
            if (items.length > 0) {
                console.log('First item:', JSON.stringify(items[0], null, 2));
                console.log(
                    'Last item:',
                    JSON.stringify(items[items.length - 1], null, 2),
                );
            }
        }

        const hasMore = items.length > limit;

        if (hasMore) {
            items.pop();
        }

        const nextCursor = this.buildNextCursor<C>(items, cursorConfig);

        if (debug && nextCursor) {
            console.log('Generated nextCursor:', nextCursor);
        }

        const remaining = Math.max(0, remainingCount - limit);

        return {
            items,
            nextCursor,
            hasMore,
            total: totalCount,
            remaining,
        };
    }

    private buildPrismaCursorConditions<C extends BaseCursor>(
        after: C,
        config: CursorConfig<T, C>,
    ): any {
        if (config.customConditionBuilder) {
            return config.customConditionBuilder(after, config);
        }

        const fields = config.cursorFields;
        if (fields.length === 0) return {};

        const conditions: any[] = [];

        // Build cursor conditions for Prisma
        for (let i = 0; i < fields.length; i++) {
            const currentField = fields[i];
            const currentDirection =
                config.sortDirections?.[currentField] || 'ASC';
            const currentOperator = currentDirection === 'DESC' ? 'lt' : 'gt';

            const levelCondition: any = {};

            // For all previous fields we add an equality condition
            for (let j = 0; j < i; j++) {
                const prevField = fields[j];
                levelCondition[String(prevField)] = this.getTypedValue(
                    after[prevField],
                    config.fieldTypes?.[prevField],
                );
            }

            // Add a comparison condition for the current field
            levelCondition[String(currentField)] = {
                [currentOperator]: this.getTypedValue(
                    after[currentField],
                    config.fieldTypes?.[currentField],
                ),
            };

            conditions.push(levelCondition);
        }

        // Return the OR condition with all levels
        return { OR: conditions };
    }

    private mergeQueries(baseQuery: any, cursorQuery: any): any {
        const result = { ...baseQuery };

        if (!result.where) {
            result.where = {};
        }

        // Merge where conditions
        if (cursorQuery.OR) {
            if (result.where.OR) {
                // If both have OR conditions, we need to AND them
                result.where = {
                    AND: [{ OR: result.where.OR }, { OR: cursorQuery.OR }],
                };
            } else {
                // If only cursor has OR, we need to AND it with existing where
                result.where = {
                    AND: [result.where, { OR: cursorQuery.OR }],
                };
            }
        }

        return result;
    }

    private getTypedValue(
        value: any,
        type?: 'date' | 'number' | 'string',
    ): any {
        if (value === null || value === undefined) {
            return value;
        }

        switch (type) {
            case 'date':
                return typeof value === 'string' ? new Date(value) : value;
            case 'number':
                return typeof value === 'string' ? Number(value) : value;
            case 'string':
                return String(value);
            default:
                return value;
        }
    }

    private buildNextCursor<C extends BaseCursor>(
        items: T[],
        config: CursorConfig<T, C>,
    ): C | null {
        if (items.length === 0) {
            return null;
        }

        const lastItem = items[items.length - 1];
        const nextCursor = {} as C;

        for (const field of config.cursorFields) {
            if (config.getFieldValue) {
                nextCursor[field] = config.getFieldValue(lastItem, field);
            } else {
                const fieldPath = String(field).split('.');
                let value: any = lastItem;

                for (const segment of fieldPath) {
                    if (value && value[segment] !== undefined) {
                        value = value[segment];
                    } else {
                        value = null;
                        break;
                    }
                }

                nextCursor[field] = value;
            }
        }

        return nextCursor;
    }
}
