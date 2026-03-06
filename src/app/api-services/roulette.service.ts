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
    let query = this.supabaseService.client
      .from('roulette_history')
      .select('*')
      .order('prize_date', { ascending: true });

    if (eventSlug) {
      query = query.eq('event_slug', eventSlug);
    }

    return from(query).pipe(
      map((res) => {
        if (res.error) throw res.error;
        return (res.data ?? []) as RouletteHistoryRow[];
      })
    );
  }
}
