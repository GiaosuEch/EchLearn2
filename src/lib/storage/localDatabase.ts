// Simple robust wrapper for localStorage to act as a database

export interface LocalDbConfig {
  prefix: string;
}

export class LocalDatabase {
  private prefix: string;

  constructor(config: LocalDbConfig = { prefix: 'echlern_db_' }) {
    this.prefix = config.prefix;
  }

  private getKey(table: string) {
    return `${this.prefix}${table}`;
  }

  public getTable<T>(table: string): T[] {
    const data = localStorage.getItem(this.getKey(table));
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public saveTable<T>(table: string, data: T[]) {
    localStorage.setItem(this.getKey(table), JSON.stringify(data));
  }

  public insert<T extends { id?: string }>(table: string, record: T): T {
    const data = this.getTable<T>(table);
    const newRecord = { ...record, id: record.id || crypto.randomUUID(), createdAt: new Date().toISOString() };
    data.push(newRecord);
    this.saveTable(table, data);
    return newRecord;
  }

  public update<T extends { id?: string }>(table: string, id: string, updates: Partial<T>): T | null {
    const data = this.getTable<T>(table);
    const idx = data.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const updatedRecord = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
    data[idx] = updatedRecord;
    this.saveTable(table, data);
    return updatedRecord;
  }

  public findById<T extends { id?: string }>(table: string, id: string): T | null {
    const data = this.getTable<T>(table);
    return data.find((r) => r.id === id) || null;
  }
  
  public findByField<T>(table: string, field: keyof T, value: any): T[] {
    const data = this.getTable<T>(table);
    return data.filter((r) => r[field] === value);
  }

  public remove(table: string, id: string): void {
    const data = this.getTable<{ id?: string }>(table);
    const filtered = data.filter((r) => r.id !== id);
    this.saveTable(table, filtered);
  }
}

export const localDb = new LocalDatabase();
