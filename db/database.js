const bcrypt = require('bcryptjs');

// In-Memory Data Store (no physical database file)
const store = {
  admins: [],
  volunteers: [],
  programs: []
};

// ── Seeding Default Data ──────────────────────────────────────────────────
const hash = bcrypt.hashSync('admin@123', 10);
store.admins.push({
  id: 1,
  name: 'NayePankh Admin',
  email: 'admin@nayepankh.com',
  password: hash,
  created_at: new Date().toISOString()
});

store.programs = [
  { id: 1, name: 'Free Tuition Initiative', description: 'One-on-one and group tutoring sessions for students from Class 1 to 12, taught by our volunteers.', icon: '📖', is_active: 1, created_at: new Date().toISOString() },
  { id: 2, name: 'Digital Literacy',        description: 'Teaching basic computer skills, internet safety, and digital tools to first-generation learners.', icon: '💻', is_active: 1, created_at: new Date().toISOString() },
  { id: 3, name: 'Scholarship Guidance',    description: 'Helping students discover and apply for government scholarships and financial aid programs.',    icon: '🎓', is_active: 1, created_at: new Date().toISOString() },
  { id: 4, name: 'Spoken English',          description: 'Confidence-building English communication classes for young adults entering the workforce.',       icon: '🗣️', is_active: 1, created_at: new Date().toISOString() },
  { id: 5, name: 'Women Empowerment',       description: 'Workshops and mentorship programs specifically designed for girls and young women.',               icon: '♀️', is_active: 1, created_at: new Date().toISOString() },
  { id: 6, name: 'Mental Health Awareness', description: 'Awareness campaigns and peer support groups addressing student stress, anxiety, and wellbeing.',  icon: '🧠', is_active: 1, created_at: new Date().toISOString() },
];

store.volunteers = [
  { id: 1, first_name:'Priya',  last_name:'Sharma', email:'priya@example.com',  phone:'+91 98765 43210', city:'Delhi',     college:'Delhi University',  area:'Education / Tutoring',   availability:'3-6 hours',  motivation:'Passionate about teaching underprivileged children.', status:'active',   created_at:'2025-01-15' },
  { id: 2, first_name:'Rahul',  last_name:'Singh',  email:'rahul@example.com',  phone:'+91 87654 32109', city:'Mumbai',    college:'IIT Bombay',        area:'Tech / Development',     availability:'6-10 hours', motivation:'Want to use tech skills for social good.',            status:'active',   created_at:'2025-01-22' },
  { id: 3, first_name:'Aisha',  last_name:'Khan',   email:'aisha@example.com',  phone:'+91 76543 21098', city:'Bangalore', college:'Christ University',  area:'Design / Creative',      availability:'1-3 hours',  motivation:'Love creating impactful designs.',                   status:'pending',  created_at:'2025-02-03' },
  { id: 4, first_name:'Vikram', last_name:'Patel',  email:'vikram@example.com', phone:'+91 65432 10987', city:'Pune',      college:'Pune University',   area:'Content & Social Media', availability:'3-6 hours',  motivation:'Social media strategy for NGOs interests me.',       status:'pending',  created_at:'2025-02-11' },
  { id: 5, first_name:'Sneha',  last_name:'Reddy',  email:'sneha@example.com',  phone:'+91 54321 09876', city:'Hyderabad', college:'BITS Pilani',        area:'Women Empowerment',      availability:'6-10 hours', motivation:'Empowering women through education.',                status:'active',   created_at:'2025-02-20' },
  { id: 6, first_name:'Arjun',  last_name:'Nair',   email:'arjun@example.com',  phone:'+91 43210 98765', city:'Kochi',     college:'NIT Calicut',       area:'Education / Tutoring',   availability:'3-6 hours',  motivation:'Teaching is my calling.',                             status:'active',   created_at:'2025-03-01' },
  { id: 7, first_name:'Meera',  last_name:'Joshi',  email:'meera@example.com',  phone:'+91 32109 87654', city:'Jaipur',    college:'MNIT Jaipur',       area:'Fundraising',            availability:'1-3 hours',  motivation:'Helping raise funds for a good cause.',              status:'inactive', created_at:'2025-03-10' },
  { id: 8, first_name:'Dev',    last_name:'Kumar',  email:'dev@example.com',    phone:'+91 21098 76543', city:'Chennai',   college:'IIT Madras',        area:'Digital Literacy',       availability:'10+ hours',  motivation:'Bridging the digital divide.',                       status:'active',   created_at:'2025-03-18' },
];

console.log('🌱 Seeded in-memory data store for Vercel.');

// ── Database API Mocking better-sqlite3 ──────────────────────────────────
const db = {
  pragma: () => {},
  exec: () => {},
  transaction: (fn) => {
    return (...args) => {
      return fn(...args);
    };
  },
  prepare: (sql) => {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');
    
    return {
      get: (...params) => {
        if (cleanSql.includes('FROM admins')) {
          if (cleanSql.includes('WHERE id = ?')) {
            return store.admins.find(a => a.id == params[0]);
          }
          if (cleanSql.includes('WHERE email = ?')) {
            return store.admins.find(a => a.email === params[0]);
          }
        }

        if (cleanSql.includes('SELECT COUNT(*) as c FROM programs')) {
          const activeOnly = cleanSql.includes('is_active = 1');
          const list = activeOnly ? store.programs.filter(p => p.is_active === 1) : store.programs;
          return { c: list.length };
        }

        if (cleanSql.includes('SELECT COUNT(*) as c FROM volunteers')) {
          if (cleanSql.includes("status = 'active'")) {
            return { c: store.volunteers.filter(v => v.status === 'active').length };
          }
          if (cleanSql.includes("status = 'pending'")) {
            return { c: store.volunteers.filter(v => v.status === 'pending').length };
          }
          if (cleanSql.includes("status = 'inactive'")) {
            return { c: store.volunteers.filter(v => v.status === 'inactive').length };
          }
          if (cleanSql.includes("status = 'rejected'")) {
            return { c: store.volunteers.filter(v => v.status === 'rejected').length };
          }
          return { c: store.volunteers.length };
        }

        if (cleanSql.includes('SELECT COUNT(*) as total FROM volunteers')) {
          const list = filterVolunteers(params, cleanSql);
          return { total: list.length };
        }

        if (cleanSql.includes('FROM volunteers WHERE')) {
          if (cleanSql.includes('WHERE id = ?')) {
            return store.volunteers.find(v => v.id == params[0]);
          }
          if (cleanSql.includes('WHERE email = ?')) {
            return store.volunteers.find(v => v.email === params[0]);
          }
        }

        if (cleanSql.includes('FROM programs WHERE id = ?')) {
          return store.programs.find(p => p.id == params[0]);
        }

        return null;
      },

      all: (...params) => {
        if (cleanSql.includes('FROM programs')) {
          let list = store.programs;
          if (cleanSql.includes('is_active = 1')) {
            list = list.filter(p => p.is_active === 1);
          }
          return list.slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
        }

        if (cleanSql.includes('SELECT * FROM volunteers ORDER BY created_at DESC') && !cleanSql.includes('LIMIT')) {
          return store.volunteers.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
        }

        if (cleanSql.includes('SELECT * FROM volunteers')) {
          let list = filterVolunteers(params, cleanSql);
          
          if (cleanSql.includes('ORDER BY created_at DESC')) {
            list = list.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
          }

          if (cleanSql.includes('LIMIT ? OFFSET ?')) {
            const offset = params[params.length - 1];
            const limit = params[params.length - 2];
            list = list.slice(offset, offset + limit);
          }

          return list;
        }

        if (cleanSql.includes('GROUP BY area')) {
          const counts = {};
          store.volunteers.forEach(v => {
            counts[v.area] = (counts[v.area] || 0) + 1;
          });
          return Object.entries(counts).map(([area, count]) => ({ area, count }));
        }

        if (cleanSql.includes('GROUP BY city')) {
          const counts = {};
          store.volunteers.forEach(v => {
            if (v.city) counts[v.city] = (counts[v.city] || 0) + 1;
          });
          return Object.entries(counts).map(([city, count]) => ({ city, count }));
        }

        if (cleanSql.includes('GROUP BY status')) {
          const counts = { active: 0, pending: 0, inactive: 0, rejected: 0 };
          store.volunteers.forEach(v => {
            counts[v.status] = (counts[v.status] || 0) + 1;
          });
          return Object.entries(counts).map(([status, count]) => ({ status, count }));
        }

        if (cleanSql.includes('LIMIT 5')) {
          return store.volunteers.slice()
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 5)
            .map(v => ({
              id: v.id,
              first_name: v.first_name,
              last_name: v.last_name,
              email: v.email,
              area: v.area,
              status: v.status,
              created_at: v.created_at
            }));
        }

        return [];
      },

      run: (...params) => {
        let lastInsertRowid = null;
        let changes = 0;

        if (cleanSql.includes('INSERT INTO admins')) {
          const id = store.admins.length > 0 ? Math.max(...store.admins.map(x => x.id)) + 1 : 1;
          const [name, email, password] = params;
          store.admins.push({ id, name, email, password, created_at: new Date().toISOString() });
          lastInsertRowid = id;
          changes = 1;
        }

        else if (cleanSql.includes('INSERT INTO programs')) {
          const id = store.programs.length > 0 ? Math.max(...store.programs.map(x => x.id)) + 1 : 1;
          const [name, description, icon] = params;
          store.programs.push({ id, name, description, icon: icon || '📚', is_active: 1, created_at: new Date().toISOString() });
          lastInsertRowid = id;
          changes = 1;
        }

        else if (cleanSql.includes('INSERT INTO volunteers')) {
          const id = store.volunteers.length > 0 ? Math.max(...store.volunteers.map(x => x.id)) + 1 : 1;
          const [first_name, last_name, email, phone, city, college, area, availability, motivation] = params;
          store.volunteers.push({
            id,
            first_name,
            last_name,
            email,
            phone: phone || null,
            city: city || null,
            college: college || null,
            area,
            availability: availability || null,
            motivation: motivation || null,
            status: 'pending',
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0]
          });
          lastInsertRowid = id;
          changes = 1;
        }

        else if (cleanSql.includes('UPDATE programs SET is_active = 0')) {
          const id = params[0];
          const prog = store.programs.find(p => p.id == id);
          if (prog) {
            prog.is_active = 0;
            changes = 1;
          }
        }

        else if (cleanSql.includes('UPDATE volunteers SET')) {
          if (cleanSql.includes('status = ?')) {
            const [status, id] = params;
            const vol = store.volunteers.find(v => v.id == id);
            if (vol) {
              vol.status = status;
              vol.updated_at = new Date().toISOString().split('T')[0];
              changes = 1;
            }
          } else {
            const [first_name, last_name, email, phone, city, college, area, availability, motivation, id] = params;
            const vol = store.volunteers.find(v => v.id == id);
            if (vol) {
              if (first_name !== undefined) vol.first_name = first_name;
              if (last_name !== undefined) vol.last_name = last_name;
              if (email !== undefined) vol.email = email;
              if (phone !== undefined) vol.phone = phone;
              if (city !== undefined) vol.city = city;
              if (college !== undefined) vol.college = college;
              if (area !== undefined) vol.area = area;
              if (availability !== undefined) vol.availability = availability;
              if (motivation !== undefined) vol.motivation = motivation;
              vol.updated_at = new Date().toISOString().split('T')[0];
              changes = 1;
            }
          }
        }

        else if (cleanSql.includes('DELETE FROM volunteers')) {
          const id = params[0];
          const index = store.volunteers.findIndex(v => v.id == id);
          if (index !== -1) {
            store.volunteers.splice(index, 1);
            changes = 1;
          }
        }

        return { lastInsertRowid, changes };
      }
    };
  }
};

// Filtering Helper
function filterVolunteers(params, sql) {
  let list = store.volunteers;
  let paramIdx = 0;

  if (sql.includes('status = ?')) {
    const status = params[paramIdx++];
    list = list.filter(v => v.status === status);
  }

  if (sql.includes('first_name LIKE ?')) {
    const qRaw = params[paramIdx];
    paramIdx += 5; 
    const q = qRaw.replace(/%/g, '').toLowerCase();
    
    list = list.filter(v => 
      (v.first_name && v.first_name.toLowerCase().includes(q)) ||
      (v.last_name && v.last_name.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q)) ||
      (v.city && v.city.toLowerCase().includes(q)) ||
      (v.college && v.college.toLowerCase().includes(q))
    );
  }

  return list;
}

module.exports = db;
