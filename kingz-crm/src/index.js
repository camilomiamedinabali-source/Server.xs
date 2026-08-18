import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CRM Endpoints

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create contact
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, company, notes } = req.body;

    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, phone, company, notes }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all deals
app.get('/api/deals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create deal
app.post('/api/deals', async (req, res) => {
  try {
    const { title, contact_id, value, stage, notes } = req.body;

    const { data, error } = await supabase
      .from('deals')
      .insert([{ title, contact_id, value, stage: stage || 'lead', notes }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update deal
app.put('/api/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const { contact_id } = req.query;
    let query = supabase.from('notes').select('*');

    if (contact_id) {
      query = query.eq('contact_id', contact_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create note
app.post('/api/notes', async (req, res) => {
  try {
    const { contact_id, deal_id, content } = req.body;

    const { data, error } = await supabase
      .from('notes')
      .insert([{ contact_id, deal_id, content }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const { data: contactCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    const { data: dealCount } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true });

    const { data: dealsTotal } = await supabase
      .from('deals')
      .select('value');

    const totalValue = dealsTotal?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;

    res.json({
      success: true,
      stats: {
        totalContacts: contactCount?.length || 0,
        totalDeals: dealCount?.length || 0,
        totalValue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'KINGZ CRM' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KINGZ CRM running on port ${PORT}`);
});
