import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface RouletteHistoryRow {
  id: string;
  created_at: string;
  event_slug: string;
  account_hash: string;
  prize_date: string;
  prize_time: string;
  item: string;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class RouletteService {
  constructor(private supabaseService: SupabaseService) {}

  getHistory(eventSlug?: string): Observable<RouletteHistoryRow[]> {
    return from(this.fetchAllRows(eventSlug));
  }

  private async fetchAllRows(eventSlug?: string): Promise<RouletteHistoryRow[]> {
    const PAGE_SIZE = 1000;
    const all: RouletteHistoryRow[] = [];
    let offset = 0;
    let done = false;

    while (!done) {
      let query = this.supabaseService.client
        .from('roulette_history')
        .select('*')
        .order('prize_date', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (eventSlug) {
        query = query.eq('event_slug', eventSlug);
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as RouletteHistoryRow[];
      all.push(...rows);

      if (rows.length < PAGE_SIZE) {
        done = true;
      } else {
        offset += PAGE_SIZE;
      }
    }

    return all;
  }
}
