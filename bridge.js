'use strict';
/**
 * bridge.js — sincroniza datos del servidor Conan Exiles con Supabase
 * Correr con: node bridge.js
 * Se puede agregar al inicio de Windows con pm2 o Task Scheduler.
 */
require('dotenv').config();
const net = require('net');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const RCON_HOST = process.env.RCON_HOST || '190.174.183.144';
const RCON_PORT = parseInt(process.env.RCON_PORT) || 25575;
const RCON_PASS = process.env.RCON_PASS || 'dani123';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { transport: ws } }
);

// ── RCON ──────────────────────────────────────────────

function buildPacket(id, type, body) {
  const b   = Buffer.from(body, 'utf8');
  const pkt = Buffer.alloc(4 + b.length + 10);
  pkt.writeInt32LE(b.length + 10, 0);
  pkt.writeInt32LE(id, 4); pkt.writeInt32LE(type, 8);
  b.copy(pkt, 12); return pkt;
}

function rcon(command) {
  return new Promise((resolve, reject) => {
    const sock = new net.Socket();
    let buf = Buffer.alloc(0), authed = false, done = false;
    const finish = (err, val) => {
      if (done) return; done = true;
      clearTimeout(timer); sock.destroy();
      err ? reject(err) : resolve(val);
    };
    const timer = setTimeout(() => finish(new Error('timeout')), 12000);
    sock.connect(RCON_PORT, RCON_HOST, () => sock.write(buildPacket(1, 3, RCON_PASS)));
    sock.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      while (buf.length >= 4) {
        const size = buf.readInt32LE(0);
        if (size < 10 || size > 65536) { finish(new Error('bad packet')); return; }
        if (buf.length < 4 + size) break;
        const id = buf.readInt32LE(4), type = buf.readInt32LE(8);
        const body = buf.slice(12, Math.max(12, size + 2)).toString('utf8').replace(/\x00/g, '').trim();
        buf = buf.slice(4 + size);
        if (!authed) {
          if (type === 2) {
            if (id === -1) { finish(new Error('RCON auth failed')); return; }
            authed = true; sock.write(buildPacket(2, 2, command));
          }
        } else { finish(null, body); return; }
      }
    });
    sock.on('error', finish);
  });
}

// ── Parsers ───────────────────────────────────────────

function parsePlayers(raw) {
  if (!raw) return [];
  return raw.split('\n').map(l => l.trim()).filter(l => /^\d+/.test(l))
    .map(line => {
      const p = line.split('|').map(s => s.trim());
      return { idx: parseInt(p[0]) || 0, name: p[1] || '?' };
    });
}

function parseSqlRows(raw) {
  if (!raw || raw.startsWith('Successfully executed')) return [];
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
  return lines.slice(1).map(line => {
    const vals = line.replace(/^#\d+\s+/, '').split('|').map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

// ── Sync funciones ────────────────────────────────────

const onlineSince    = new Map();
let   currentOnline  = new Map(); // nombre → idx de jugadores online ahora

async function syncOnlinePlayers() {
  try {
    const raw     = await rcon('listplayers');
    const players = parsePlayers(raw).filter(p => p.name !== '?');
    const names   = players.map(p => p.name);

    if (!names.length) {
      await supabase.from('online_players').delete().neq('name', '__never__');
      onlineSince.clear();
      currentOnline.clear();
      console.log('[bridge] 0 jugadores online — tabla limpiada');
      return;
    }

    // Enriquecer con nivel y clan — CAST porque g.name es BLOB en SQLite
    const list  = names.map(n => `'${n.replace(/'/g, "''")}'`).join(',');
    const raw2  = await rcon(`sql SELECT c.char_name, c.level, c.id, CAST(g.name AS TEXT) as clan, g.owner FROM characters c LEFT JOIN guilds g ON c.guild = g.guildId WHERE c.char_name IN (${list})`);
    const rows  = parseSqlRows(raw2);
    const charMap = {};
    rows.forEach(r => {
      charMap[r.char_name] = {
        level:     parseInt(r.level) || 0,
        clan:      r.clan && r.clan !== 'void' ? r.clan : null,
        is_leader: r.owner && r.id && r.owner.trim() === r.id.trim(),
      };
    });

    // Mapa nombre → idx para usar con el comando 'con'
    currentOnline = new Map(players.map(p => [p.name, p.idx]));

    const now = Date.now();
    names.forEach(n => { if (!onlineSince.has(n)) onlineSince.set(n, now); });
    for (const [n] of onlineSince) { if (!names.includes(n)) onlineSince.delete(n); }

    const upserts = names.map(name => ({
      name,
      level:       charMap[name]?.level ?? 0,
      clan:        charMap[name]?.clan  ?? null,
      is_leader:   charMap[name]?.is_leader ?? false,
      online_since: onlineSince.get(name),
      updated_at:  new Date().toISOString(),
    }));

    await supabase.from('online_players').upsert(upserts, { onConflict: 'name' });
    // Eliminar los que ya no están online
    await supabase.from('online_players').delete().not('name', 'in', `(${names.map(n => `"${n}"`).join(',')})`);

    console.log(`[bridge] ${names.length} jugadores online sincronizados`);
  } catch (e) {
    console.error('[bridge] Error sync players:', e.message);
  }
}

async function sendVerificationCodes() {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('char_name, verification_code')
      .eq('verified', false)
      .not('verification_code', 'is', null)
      .not('char_name', 'is', null)
      .neq('char_name', '');

    if (!data?.length) return;

    for (const p of data) {
      if (!currentOnline.has(p.char_name)) continue;
      try {
        await rcon(`directmessage "Tienda D&D" "${p.char_name}" "Código de verificación del sitio web: ${p.verification_code}"`);
        console.log(`[bridge] Código enviado a ${p.char_name}: ${p.verification_code}`);
      } catch (e) {
        console.error(`[bridge] Error enviando código a ${p.char_name}:`, e.message);
      }
    }
  } catch (e) {
    console.error('[bridge] Error sendVerificationCodes:', e.message);
  }
}

async function deliverPendingItems() {
  try {
    const { data } = await supabase
      .from('requests')
      .select('id, character_name, item_name, market_items(template_id)')
      .eq('type', 'market')
      .eq('status', 'approved');

    if (!data?.length) return;

    for (const req of data) {
      const charName   = req.character_name;
      const templateId = req.market_items?.template_id;
      const itemName   = req.item_name || '?';

      const playerIdx = currentOnline.get(charName);
      if (playerIdx === undefined) continue; // offline, reintenta en 30s

      let rconNote;
      if (!templateId) {
        rconNote = 'Sin template_id — actualizar el ID en MERCADO y reintentar.';
      } else {
        try {
          const resp = await rcon(`con ${playerIdx} SpawnItem ${templateId} 1`);
          console.log(`[bridge] SpawnItem response: "${resp}"`);
          // Notificar al jugador
          try { await rcon(`directmessage "Tienda D&D" "${charName}" "Tu pedido de ${itemName} fue entregado! Revisa tu inventario."`); } catch {}
          rconNote = `Entregado (SpawnItem ${templateId}, idx=${playerIdx}). Resp: ${resp}`;
          console.log(`[bridge] ✓ Ítem entregado: ${itemName} → ${charName}`);
        } catch (e) {
          rconNote = `SpawnItem falló: ${e.message} — entregar manualmente.`;
          console.error(`[bridge] Delivery falló para ${charName}:`, e.message);
        }
      }

      await supabase.from('requests').update({
        status:       'delivered',
        processed_at: new Date().toISOString(),
        rcon_note:    rconNote,
      }).eq('id', req.id);
    }
  } catch (e) {
    console.error('[bridge] Error deliverPendingItems:', e.message);
  }
}

async function syncRanking() {
  try {
    // CAST porque g.name es BLOB en SQLite — sin esto devuelve la palabra "BLOB" literalmente
    const raw  = await rcon('sql SELECT c.char_name, c.level, c.id, CAST(g.name AS TEXT) as clan, g.owner FROM characters c LEFT JOIN guilds g ON c.guild = g.guildId WHERE c.level > 0 ORDER BY c.level DESC LIMIT 200');
    const rows = parseSqlRows(raw);
    if (!rows.length) return;

    const upserts = rows.map(r => ({
      name:       r.char_name,
      level:      parseInt(r.level) || 0,
      clan:       r.clan && r.clan !== 'void' ? r.clan : null,
      updated_at: new Date().toISOString(),
    }));
    await supabase.from('characters_ranking').upsert(upserts, { onConflict: 'name' });

    // Persistir is_leader una vez que la columna exista:
    // ALTER TABLE characters_ranking ADD COLUMN IF NOT EXISTS is_leader boolean DEFAULT false;
    // Luego descomentar:
    // for (const r of rows) {
    //   const isLeader = !!(r.owner && r.id && r.owner.trim() === r.id.trim());
    //   if (isLeader) await supabase.from('characters_ranking').update({ is_leader: true }).eq('name', r.char_name);
    // }

    console.log(`[bridge] Ranking actualizado (${rows.length} personajes)`);
  } catch (e) {
    console.error('[bridge] Error sync ranking:', e.message);
  }
}
async function syncClans() {
  try {

    const raw = await rcon(
      `sql SELECT
        CAST(g.name AS TEXT) as clan,
        g.owner,
        COUNT(c.id) as members_count
       FROM guilds g
       LEFT JOIN characters c ON c.guild = g.guildId
       GROUP BY g.guildId`
    );

    const rows = parseSqlRows(raw);

    if (!rows.length) return;

    const upserts = rows.map(r => ({
      clan_name: r.clan,
      leader_id: r.owner,
      members_count: parseInt(r.members_count) || 0,
      updated_at: new Date().toISOString()
    }));

    await supabase
      .from('clans')
      .upsert(upserts, { onConflict: 'clan_name' });

    console.log(`[bridge] ${rows.length} clanes sincronizados`);

  } catch (e) {
    console.error('[bridge] Error sync clans:', e.message);
  }
}

// ── Loop principal ────────────────────────────────────

async function run() {
  console.log('\n🐉  Bridge Dragones y Demonios → Supabase\n');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('ERROR: Falta SUPABASE_URL o SUPABASE_SERVICE_KEY en .env');
    process.exit(1);
  }

  await syncOnlinePlayers();
  await deliverPendingItems();
  await syncRanking();
  await syncClans();

  // Online + entregas + verificaciones: cada 30s
  setInterval(async () => {
    await syncOnlinePlayers();
    await deliverPendingItems();
    await sendVerificationCodes();
  }, 30_000);
  // Ranking: cada 5 min
  setInterval(syncRanking, 300_000);
  setInterval(syncClans, 300000);
}

run();
