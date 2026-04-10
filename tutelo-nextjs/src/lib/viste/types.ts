// ============================================
// View definition schema
// ============================================

export const ALLOWED_ENTITIES = ['persone', 'preventivi'] as const;
export type Entity = typeof ALLOWED_ENTITIES[number];

export const AGG_OPS = ['count', 'sum', 'avg', 'min', 'max'] as const;
export type AggOp = typeof AGG_OPS[number];

export const FILTER_OPS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'ilike'] as const;
export type FilterOp = typeof FILTER_OPS[number];

export const VIZ_TYPES = ['table', 'kpi', 'bar_chart', 'pie_chart'] as const;
export type VizType = typeof VIZ_TYPES[number];

// Fields allowed per entity (whitelist)
export const ENTITY_FIELDS: Record<Entity, string[]> = {
  persone: [
    'id', 'nome', 'cognome', 'email', 'telefono', 'codice_fiscale',
    'status', 'fonte', 'created_at', 'updated_at',
  ],
  preventivi: [
    'id', 'contatto_id', 'tipo', 'stato', 'created_at', 'updated_at',
  ],
};

export interface Filter {
  field: string;
  op: FilterOp;
  value: string | number | boolean | Array<string | number>;
}

export interface Aggregation {
  field: string;
  op: AggOp;
  as: string;
}

export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Join {
  // For preventivi entity: join with persone to get name/surname
  entity: 'persone';
  on: 'contatto_id';
  as_prefix?: string; // e.g. "persona" → persona_nome, persona_cognome
  fields: Array<'nome' | 'cognome' | 'email'>;
}

export interface Visualization {
  type: VizType;
  title?: string;
  // For bar/pie charts:
  x_field?: string; // category axis (bar) or label (pie)
  y_field?: string; // value axis (bar) or value (pie)
  // For KPI:
  value_field?: string;
  label?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface ViewDefinition {
  entity: Entity;
  select?: string[];       // columns to select (for table mode without group_by)
  filters?: Filter[];
  group_by?: string[];
  aggregations?: Aggregation[];
  join?: Join;
  order_by?: OrderBy[];
  limit?: number;
  visualization: Visualization;
}

export interface ViewResult {
  columns: string[];
  rows: Record<string, unknown>[];
  total_count?: number;
}
