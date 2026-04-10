import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  ALLOWED_ENTITIES,
  ENTITY_FIELDS,
  AGG_OPS,
  FILTER_OPS,
  VIZ_TYPES,
  type ViewDefinition,
  type ViewResult,
  type Filter,
  type Entity,
} from './types';

const TABLE_MAP: Record<Entity, string> = {
  persone: 'tutelonxtjs_persone',
  preventivi: 'tutelonxtjs_preventivi',
};

// ============================================
// Validation
// ============================================

export function validateDefinition(def: unknown): asserts def is ViewDefinition {
  if (!def || typeof def !== 'object') {
    throw new Error('Definition must be an object');
  }
  const d = def as Partial<ViewDefinition>;

  if (!d.entity || !ALLOWED_ENTITIES.includes(d.entity as Entity)) {
    throw new Error(`Entity must be one of: ${ALLOWED_ENTITIES.join(', ')}`);
  }

  const allowedFields = ENTITY_FIELDS[d.entity as Entity];

  // Validate filters
  if (d.filters) {
    if (!Array.isArray(d.filters)) throw new Error('filters must be an array');
    for (const f of d.filters) {
      if (!allowedFields.includes(f.field)) {
        throw new Error(`Filter field '${f.field}' not allowed for entity '${d.entity}'`);
      }
      if (!FILTER_OPS.includes(f.op)) {
        throw new Error(`Filter op '${f.op}' not allowed`);
      }
    }
  }

  // Validate group_by
  if (d.group_by) {
    if (!Array.isArray(d.group_by)) throw new Error('group_by must be an array');
    for (const g of d.group_by) {
      if (!allowedFields.includes(g)) {
        throw new Error(`group_by field '${g}' not allowed`);
      }
    }
  }

  // Validate aggregations
  if (d.aggregations) {
    if (!Array.isArray(d.aggregations)) throw new Error('aggregations must be an array');
    for (const a of d.aggregations) {
      if (a.op !== 'count' && !allowedFields.includes(a.field)) {
        throw new Error(`Aggregation field '${a.field}' not allowed`);
      }
      if (!AGG_OPS.includes(a.op)) {
        throw new Error(`Aggregation op '${a.op}' not allowed`);
      }
      if (!a.as || typeof a.as !== 'string') {
        throw new Error('Aggregation must have a valid "as" name');
      }
    }
  }

  // Validate order_by
  if (d.order_by) {
    if (!Array.isArray(d.order_by)) throw new Error('order_by must be an array');
    for (const o of d.order_by) {
      if (!o.field || typeof o.field !== 'string') {
        throw new Error('order_by entries must have a field');
      }
      if (o.direction !== 'asc' && o.direction !== 'desc') {
        throw new Error('order_by direction must be asc or desc');
      }
    }
  }

  // Validate visualization
  if (!d.visualization || !VIZ_TYPES.includes(d.visualization.type)) {
    throw new Error(`visualization.type must be one of: ${VIZ_TYPES.join(', ')}`);
  }

  // Validate limit
  if (d.limit !== undefined) {
    if (typeof d.limit !== 'number' || d.limit < 1 || d.limit > 1000) {
      throw new Error('limit must be a number between 1 and 1000');
    }
  }

  // Validate join (only for preventivi → persone)
  if (d.join) {
    if (d.entity !== 'preventivi') {
      throw new Error('join is only allowed with entity "preventivi"');
    }
    if (d.join.entity !== 'persone' || d.join.on !== 'contatto_id') {
      throw new Error('join must be { entity: "persone", on: "contatto_id" }');
    }
  }
}

// ============================================
// Apply filters to a Supabase query builder
// ============================================
type QueryBuilder = ReturnType<typeof supabaseAdmin.from>;

function applyFilters(q: any, filters: Filter[]): any {
  for (const f of filters) {
    switch (f.op) {
      case 'eq': q = q.eq(f.field, f.value); break;
      case 'neq': q = q.neq(f.field, f.value); break;
      case 'gt': q = q.gt(f.field, f.value); break;
      case 'gte': q = q.gte(f.field, f.value); break;
      case 'lt': q = q.lt(f.field, f.value); break;
      case 'lte': q = q.lte(f.field, f.value); break;
      case 'in': q = q.in(f.field, Array.isArray(f.value) ? f.value : [f.value]); break;
      case 'ilike': q = q.ilike(f.field, `%${f.value}%`); break;
    }
  }
  return q;
}

// ============================================
// Execute view definition
// ============================================

export async function executeView(def: ViewDefinition): Promise<ViewResult> {
  validateDefinition(def);

  const table = TABLE_MAP[def.entity];
  const limit = def.limit ?? 100;

  // ------- Case 1: NO group_by, NO aggregations → plain SELECT -------
  if (!def.group_by?.length && !def.aggregations?.length) {
    const selectFields = def.select?.length
      ? def.select.filter((f) => ENTITY_FIELDS[def.entity].includes(f))
      : ENTITY_FIELDS[def.entity];

    let selectClause = selectFields.join(',');
    if (def.join) {
      const joinFields = def.join.fields.join(',');
      selectClause += `,persona:${TABLE_MAP[def.join.entity]}!${def.join.on}(${joinFields})`;
    }

    let query: any = supabaseAdmin.from(table).select(selectClause);
    if (def.filters) query = applyFilters(query, def.filters);
    if (def.order_by) {
      for (const o of def.order_by) {
        query = query.order(o.field, { ascending: o.direction === 'asc' });
      }
    }
    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Flatten joined fields
    const rows: Record<string, unknown>[] = (data || []).map((row: any) => {
      const flat: Record<string, unknown> = { ...row };
      if (def.join && row.persona) {
        const prefix = def.join.as_prefix || def.join.entity;
        for (const f of def.join.fields) {
          flat[`${prefix}_${f}`] = row.persona[f];
        }
        delete flat.persona;
      }
      return flat;
    });

    const columns = rows.length > 0 ? Object.keys(rows[0]) : selectFields;
    return { columns, rows, total_count: rows.length };
  }

  // ------- Case 2: group_by + aggregations → manual aggregation in Node -------
  // (Supabase PostgREST has limited support for aggregations; safer to fetch and group here)

  // Build select for the raw data
  const neededFields = new Set<string>();
  def.group_by?.forEach((f) => neededFields.add(f));
  def.aggregations?.forEach((a) => {
    if (a.op !== 'count') neededFields.add(a.field);
  });
  neededFields.add('id'); // always fetch id for count

  let selectClause = Array.from(neededFields).join(',');
  if (def.join) {
    const joinFields = def.join.fields.join(',');
    selectClause += `,persona:${TABLE_MAP[def.join.entity]}!${def.join.on}(${joinFields})`;
  }

  let query: any = supabaseAdmin.from(table).select(selectClause);
  if (def.filters) query = applyFilters(query, def.filters);
  // Fetch up to 10000 rows for aggregation (safe upper bound for MVP)
  query = query.limit(10000);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // Flatten join
  const flatRows: Record<string, unknown>[] = (data || []).map((row: any) => {
    const flat: Record<string, unknown> = { ...row };
    if (def.join && row.persona) {
      const prefix = def.join.as_prefix || def.join.entity;
      for (const f of def.join.fields) {
        flat[`${prefix}_${f}`] = row.persona[f];
      }
      delete flat.persona;
    }
    return flat;
  });

  // Group in memory
  const groupBy = def.group_by || [];
  const aggregations = def.aggregations || [];

  type Group = { key: string; groupFields: Record<string, unknown>; rows: Record<string, unknown>[] };
  const groups = new Map<string, Group>();

  for (const row of flatRows) {
    const groupFields: Record<string, unknown> = {};
    const keyParts: string[] = [];

    for (const gf of groupBy) {
      // Try direct field or joined field (persona_nome, etc.)
      let value = row[gf];
      if (value === undefined && def.join) {
        const prefix = def.join.as_prefix || def.join.entity;
        value = row[`${prefix}_${def.join.fields[0]}`];
      }
      groupFields[gf] = value;
      keyParts.push(String(value ?? ''));
    }

    // Also include joined fields in group key for display
    if (def.join) {
      const prefix = def.join.as_prefix || def.join.entity;
      for (const jf of def.join.fields) {
        const key = `${prefix}_${jf}`;
        groupFields[key] = row[key];
      }
    }

    const key = keyParts.join('|');
    if (!groups.has(key)) {
      groups.set(key, { key, groupFields, rows: [] });
    }
    groups.get(key)!.rows.push(row);
  }

  // Apply aggregations
  const aggregated: Record<string, unknown>[] = [];
  for (const group of groups.values()) {
    const result: Record<string, unknown> = { ...group.groupFields };
    for (const agg of aggregations) {
      const values = group.rows
        .map((r) => r[agg.field])
        .filter((v) => v !== null && v !== undefined);
      switch (agg.op) {
        case 'count':
          result[agg.as] = group.rows.length;
          break;
        case 'sum':
          result[agg.as] = values.reduce((a: number, b: any) => a + (Number(b) || 0), 0);
          break;
        case 'avg':
          result[agg.as] = values.length
            ? values.reduce((a: number, b: any) => a + (Number(b) || 0), 0) / values.length
            : 0;
          break;
        case 'min':
          result[agg.as] = values.reduce(
            (a: any, b: any) => (a === null || Number(b) < Number(a) ? b : a),
            null,
          );
          break;
        case 'max':
          result[agg.as] = values.reduce(
            (a: any, b: any) => (a === null || Number(b) > Number(a) ? b : a),
            null,
          );
          break;
      }
    }
    aggregated.push(result);
  }

  // Order
  if (def.order_by?.length) {
    aggregated.sort((a, b) => {
      for (const o of def.order_by!) {
        const av = a[o.field];
        const bv = b[o.field];
        if (av === bv) continue;
        const cmp = (av as any) > (bv as any) ? 1 : -1;
        return o.direction === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }

  const sliced = aggregated.slice(0, limit);
  const columns = sliced.length > 0 ? Object.keys(sliced[0]) : [];

  return {
    columns,
    rows: sliced,
    total_count: aggregated.length,
  };
}
