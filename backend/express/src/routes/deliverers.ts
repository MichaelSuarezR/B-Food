import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Helper to fetch existing availability by user_id
const findAvailability = async (userId: string) => {
  return supabase
    .from('deliver_availability')
    .select('id, user_id, hall_id, desired_order, active, updated_at')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
};

// Activate or update availability
router.post('/activate', async (req: Request, res: Response) => {
  const { user_id, hall_id, desired_order } = req.body ?? {};

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id (string) is required' });
  }
  if (!hall_id || typeof hall_id !== 'string') {
    return res.status(400).json({ error: 'hall_id (string) is required' });
  }
  if (!desired_order || typeof desired_order !== 'string') {
    return res.status(400).json({ error: 'desired_order (string) is required' });
  }

  const now = new Date().toISOString();

  // See if a row exists for this user_id
  const { data: existing, error: findError } = await findAvailability(user_id);
  if (findError) {
    return res.status(500).json({ error: findError.message });
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from('deliver_availability')
      .update({
        hall_id,
        desired_order,
        active: true,
        updated_at: now,
      })
      .eq('id', existing.id)
      .select('id, user_id, hall_id, desired_order, active, updated_at')
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ availability: data });
  }

  const { data, error } = await supabase
    .from('deliver_availability')
    .insert([
      {
        user_id,
        hall_id,
        desired_order,
        active: true,
        updated_at: now,
      },
    ])
    .select('id, user_id, hall_id, desired_order, active, updated_at')
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ availability: data });
});

// Deactivate
router.post('/deactivate', async (req: Request, res: Response) => {
  const { user_id } = req.body ?? {};

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id (string) is required' });
  }

  const { data: existing, error: findError } = await findAvailability(user_id);
  if (findError) {
    return res.status(500).json({ error: findError.message });
  }
  if (!existing?.id) {
    return res.status(404).json({ error: 'No availability found for user' });
  }

  const { data, error } = await supabase
    .from('deliver_availability')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', existing.id)
    .select('id, user_id, hall_id, desired_order, active, updated_at')
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ availability: data });
});

// List active deliverers (optionally by hall)
router.get('/', async (req: Request, res: Response) => {
  const hallId = typeof req.query.hall_id === 'string' ? req.query.hall_id : undefined;

  let query = supabase
    .from('deliver_availability')
    .select('id, user_id, hall_id, desired_order, active, updated_at')
    .eq('active', true)
    .order('updated_at', { ascending: false });

  if (hallId) {
    query = query.eq('hall_id', hallId);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ deliverers: data ?? [] });
});

export default router;
