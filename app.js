const mockDocuments = [{ id: 1, title: "UGC Guidelines for PhD Admission 2024", type: "regulation", issuer: "UGC", date: "2024-03-15", tags: ["phd", "admission"], content: "The University Grants Commission has issued revised guidelines for PhD admission across all Indian universities. Key changes include mandatory entrance test, reduced coursework duration, and updated eligibility criteria for candidates from interdisciplinary backgrounds.", url: "https://ugc.ac.in/phd-guidelines-2024" }, { id: 2, title: "AICTE Faculty Workload Norms Update", type: "rule", issuer: "AICTE", date: "2024-02-20", tags: ["faculty", "workload"], content: "All India Council for Technical Education has updated faculty workload norms for engineering colleges. Teaching load reduced from 16 to 14 hours per week for assistant professors. Research and administrative duties now count towards total workload.", url: "https://aicte.ac.in/faculty-norms-2024" }, { id: 3, title: "National Scholarship Portal Integration Scheme", type: "scheme", issuer: "MoE", date: "2024-01-10", tags: ["scholarship", "portal"], content: "Ministry of Education announces unified scholarship disbursement through National Scholarship Portal. All state and central scholarships to be processed through single platform. SC/ST/OBC students can apply for multiple schemes simultaneously.", url: "https://moe.gov.in/nsp-integration" }, { id: 4, title: "AI Integration in Engineering Curriculum Policy", type: "policy", issuer: "AICTE", date: "2024-04-05", tags: ["ai", "curriculum"], content: "AICTE mandates integration of Artificial Intelligence and Machine Learning modules in all engineering programs. Minimum 20 credits of AI-related coursework required across four years. Faculty training programs to be conducted.", url: "https://aicte.ac.in/ai-curriculum-2024" }, { id: 5, title: "State Scholarship Scheme for Minorities 2024", type: "scheme", issuer: "State Dept", date: "2024-02-28", tags: ["scholarship", "minorities"], content: "State government launches comprehensive scholarship scheme for minority students. Coverage includes tuition fees, hostel charges, and book allowance. Income limit set at Rs. 2.5 lakh per annum for eligibility.", url: "https://state.gov.in/minority-scholarship" }, { id: 6, title: "NAAC Accreditation Framework Revision", type: "regulation", issuer: "UGC", date: "2024-03-30", tags: ["accreditation", "quality"], content: "National Assessment and Accreditation Council introduces revised accreditation framework. Greater emphasis on outcome-based education, research output, and student satisfaction. Digital submission of all documents mandatory.", url: "https://naac.gov.in/framework-2024" }, { id: 7, title: "Common University Entrance Test Implementation", type: "project", issuer: "UGC", date: "2024-01-25", tags: ["exam", "admission"], content: "UGC to implement Common University Entrance Test for undergraduate admissions across central universities. Single test to replace multiple university-specific entrance exams. First phase to cover 45 central universities.", url: "https://ugc.ac.in/cuet-project" }, { id: 8, title: "Faculty Appraisal System Guidelines", type: "rule", issuer: "UGC", date: "2024-02-15", tags: ["faculty", "appraisal"], content: "Updated guidelines for faculty performance appraisal system. API scoring revised with increased weightage for research publications. Teaching feedback from students to constitute 30% of total score.", url: "https://ugc.ac.in/faculty-appraisal" }];

const state = { filters: { type: 'all', issuer: 'any', fromDate: '', toDate: '', tags: [], mode: 'hybrid', sort: 'recent' }, searchQuery: '', results: [], selectedDoc: null, collection: [] };

const $ = (s, a = document) => a.querySelector(s), $$ = (s, a = document) => a.querySelectorAll(s);

document.addEventListener('DOMContentLoaded', () => {
    initFilters(); initSearch(); initQuickChips(); initAdmin(); initRightPanel(); performSearch();
});

function initFilters() {
    $$('#typeChips .chip').forEach(c => c.onclick = () => {
        $$('#typeChips .chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active'); state.filters.type = c.dataset.type; performSearch();
    });
    $('#issuer').onchange = e => { state.filters.issuer = e.target.value; performSearch() };
    $('#fromDate').onchange = e => { state.filters.fromDate = e.target.value; performSearch() };
    $('#toDate').onchange = e => { state.filters.toDate = e.target.value; performSearch() };
    $$('#tags .chip').forEach(c => c.onclick = () => {
        c.classList.toggle('active');
        const t = c.dataset.tag;
        c.classList.contains('active') ? state.filters.tags.push(t) : state.filters.tags = state.filters.tags.filter(x => x !== t);
        performSearch();
    });
    $$('#modeChips .chip').forEach(c => c.onclick = () => {
        $$('#modeChips .chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active'); state.filters.mode = c.dataset.mode; performSearch();
    });
    $$('[data-sort]').forEach(c => c.onclick = () => {
        $$('[data-sort]').forEach(x => x.classList.remove('active'));
        c.classList.add('active'); state.filters.sort = c.dataset.sort; performSearch();
    });
    $('#saveSearch').onclick = () => {
        const n = prompt('Enter a name for this filter configuration:');
        if (n) {
            const s = JSON.parse(localStorage.getItem('savedFilters') || '[]');
            s.push({ name: n, filters: { ...state.filters } });
            localStorage.setItem('savedFilters', JSON.stringify(s));
            alert(`Filter "${n}" saved successfully!`);
        }
    };
}

function initSearch() {
    const doSearch = () => { state.searchQuery = $('#q').value; performSearch() };
    $('#searchBtn').onclick = doSearch;
    $('#q').onkeypress = e => e.key === 'Enter' && doSearch();
    $('#suggestBtn').onclick = () => {
        const sugs = ['Show all UGC regulations from 2024', 'Find scholarship schemes for engineering students', 'AICTE policies on faculty recruitment', 'Recent changes in PhD admission criteria', 'State-wise scholarship comparison for minorities'];
        const s = sugs[Math.floor(Math.random() * sugs.length)];
        $('#q').value = s; state.searchQuery = s; performSearch();
    };
}

function initQuickChips() {
    $$('#quickChips .chip').forEach(c => c.onclick = () => {
        const q = c.dataset.quick; $('#q').value = q; state.searchQuery = q; performSearch();
    });
}

function performSearch() {
    let r = [...mockDocuments];
    if (state.filters.type !== 'all') r = r.filter(d => d.type === state.filters.type);
    if (state.filters.issuer !== 'any') r = r.filter(d => d.issuer === state.filters.issuer);
    if (state.filters.fromDate) r = r.filter(d => d.date >= state.filters.fromDate);
    if (state.filters.toDate) r = r.filter(d => d.date <= state.filters.toDate);
    if (state.filters.tags.length) r = r.filter(d => state.filters.tags.some(t => d.tags.includes(t)));
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        r = r.filter(d => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q)));
    }
    r.sort((a, b) => state.filters.sort === 'recent' ? new Date(b.date) - new Date(a.date) : state.filters.sort === 'issuer' ? a.issuer.localeCompare(b.issuer) : 0);
    state.results = r; renderResults(); updateInsights();
}

function renderResults() {
    const rl = $('#resultList'), rc = $('#resCount');
    rc.textContent = state.results.length;
    if (!state.results.length) { rl.innerHTML = '<div class="empty">No documents match your search criteria. Try adjusting filters or search terms.</div>'; return }
    rl.innerHTML = state.results.map(d => `<div class="result-card" data-id="${d.id}"><div class="result-header"><div><div class="result-title">${d.title}</div><div class="result-meta"><span class="pill">${d.type}</span><span class="note">${d.issuer}</span><span class="note">${fmtDate(d.date)}</span></div></div><button class="btn-icon" data-action="save" data-id="${d.id}" title="Save to collection"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button></div><div class="result-content">${d.content}</div><div class="result-tags">${d.tags.map(t => `<span class="pill">${t}</span>`).join('')}</div></div>`).join('');
    $$('.result-card').forEach(c => c.onclick = e => !e.target.closest('[data-action="save"]') && selectDoc(+c.dataset.id));
    $$('[data-action="save"]').forEach(b => b.onclick = e => { e.stopPropagation(); addToCol(+b.dataset.id) });
}

function selectDoc(id) {
    const d = mockDocuments.find(x => x.id === id);
    if (!d) return;
    state.selectedDoc = d;
    $('#docBody').innerHTML = `<div class="doc-title">${d.title}</div><div class="doc-meta"><span class="pill">${d.type}</span><span class="note">Issued by ${d.issuer}</span><span class="note">${fmtDate(d.date)}</span></div><div class="doc-content"><h3>Document Content</h3><p>${d.content}</p><h3>Key Information</h3><div class="kv"><div><span class="label">Type:</span> <span>${d.type}</span></div><div><span class="label">Issuing Body:</span> <span>${d.issuer}</span></div><div><span class="label">Date:</span> <span>${fmtDate(d.date)}</span></div><div><span class="label">Tags:</span> <span>${d.tags.join(', ')}</span></div><div><span class="label">Source URL:</span> <span>${d.url}</span></div></div><h3>Related Documents</h3><p class="note">Found 3 related documents based on content similarity...</p></div>`;
    updateCite(d);
    $$('.result-card').forEach(c => c.classList.remove('selected'));
    $(`[data-id="${id}"]`)?.classList.add('selected');
}

function updateInsights() {
    const ins = $('#insights');
    if (!state.results.length) { ins.innerHTML = '<div class="empty">No insights available.</div>'; return }
    const iss = [...new Set(state.results.map(d => d.issuer))];
    const typ = [...new Set(state.results.map(d => d.type))];
    const tags = [...new Set(state.results.flatMap(d => d.tags))].slice(0, 5);
    ins.innerHTML = `<div><span class="label">Total Documents:</span> <span>${state.results.length}</span></div><div><span class="label">Issuers:</span> <span>${iss.join(', ')}</span></div><div><span class="label">Document Types:</span> <span>${typ.join(', ')}</span></div><div><span class="label">Common Tags:</span> <span>${tags.join(', ')}</span></div><div><span class="label">Date Range:</span> <span>${getDateRange()}</span></div>`;
}

function updateCite(d) {
    $('#citations').innerHTML = `<div><span class="label">APA:</span> <span>${d.issuer}. (${d.date.slice(0, 4)}). ${d.title}. Retrieved from ${d.url}</span></div><div><span class="label">MLA:</span> <span>${d.issuer}. "${d.title}." ${fmtDate(d.date)}. Web.</span></div><div><span class="label">Chicago:</span> <span>${d.issuer}. "${d.title}." Accessed ${fmtDate(new Date().toISOString().split('T')[0])}. ${d.url}</span></div>`;
}

function addToCol(id) {
    const d = mockDocuments.find(x => x.id === id);
    if (!d) return;
    if (state.collection.find(x => x.id === id)) { alert('Document already in collection!'); return }
    state.collection.push(d); updateColTable(); alert(`"${d.title}" added to collection!`);
}

function updateColTable() {
    const tb = $('#collectionBody');
    if (!state.collection.length) { tb.innerHTML = '<tr><td colspan="4" class="empty">No items saved.</td></tr>'; return }
    tb.innerHTML = state.collection.map(d => `<tr><td>${d.title}</td><td><span class="pill">${d.type}</span></td><td>${d.issuer}</td><td><button class="btn" data-action="remove" data-id="${d.id}">Remove</button></td></tr>`).join('');
    $$('[data-action="remove"]').forEach(b => b.onclick = () => { state.collection = state.collection.filter(d => d.id !== +b.dataset.id); updateColTable() });
}

function initRightPanel() {
    $('#openSource').onclick = () => state.selectedDoc ? window.open(state.selectedDoc.url, '_blank') : alert('Please select a document first.');
    $('#saveDoc').onclick = () => state.selectedDoc ? addToCol(state.selectedDoc.id) : alert('Please select a document first.');
    $('#citeDoc').onclick = () => {
        if (state.selectedDoc) {
            const c = `${state.selectedDoc.issuer}. (${state.selectedDoc.date.slice(0, 4)}). ${state.selectedDoc.title}. Retrieved from ${state.selectedDoc.url}`;
            navigator.clipboard.writeText(c); alert('Citation copied to clipboard!');
        } else alert('Please select a document first.');
    };
    $('#askAI').onclick = () => askAI();
}

function initAdmin() {
    const st = $('#adminStatus');
    $('#ingestBtn').onclick = () => { st.textContent = 'Ingesting...'; setTimeout(() => { st.textContent = 'Ingest Complete'; alert('Mock: 150 new documents ingested and indexed.'); setTimeout(() => st.textContent = 'Idle', 2000) }, 1500) };
    $('#reindexBtn').onclick = () => { st.textContent = 'Re-indexing...'; setTimeout(() => { st.textContent = 'Index Updated'; alert('Mock: Search index rebuilt successfully.'); setTimeout(() => st.textContent = 'Idle', 2000) }, 2000) };
    $('#validateBtn').onclick = () => { st.textContent = 'Validating...'; setTimeout(() => { st.textContent = 'Validation Complete'; alert('Mock: All documents validated. 8 warnings found, 0 errors.'); setTimeout(() => st.textContent = 'Idle', 2000) }, 1000) };
}

function fmtDate(ds) { return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

function getDateRange() {
    if (!state.results.length) return 'N/A';
    const dt = state.results.map(d => new Date(d.date));
    const min = new Date(Math.min(...dt)), max = new Date(Math.max(...dt));
    return `${fmtDate(min.toISOString().split('T')[0])} - ${fmtDate(max.toISOString().split('T')[0])}`;
}

async function askAI() {
    if (!state.results.length) {
        alert('Please perform a search first to have documents for AI analysis.');
        return;
    }

    const q = prompt('Ask AI about the search results:\n\nExample questions:\n- Summarize the key points\n- What are the eligibility criteria?\n- Compare policies across issuers');
    if (!q || !q.trim()) return;

    const btn = $('#askAI'), txt = btn.textContent;
    btn.textContent = 'Thinking...';
    btn.disabled = true;

    try {
        // Take top 5 results as context
        const ctx = state.results.slice(0, 5).map((d, i) =>
            `[Document ${i + 1}]\nTitle: ${d.title}\nType: ${d.type}\nIssuer: ${d.issuer}\nDate: ${d.date}\nContent: ${d.content}\nTags: ${d.tags.join(', ')}`
        ).join('\n\n');

        const ans = await callGeminiAI(q, ctx);
        showAIRes(q, ans);
    } catch (e) {
        console.error('AI API Error:', e);
        alert(`Error: ${e.message}`);
    } finally {
        btn.textContent = txt;
        btn.disabled = false;
    }
}

async function callGeminiAI(q, ctx) {
    const API_KEY = 'AIzaSyCqYGwPrwf23DusTG_5KN3Bi733h5ZH_G8'; // Replace with your Gemini API key
    if (!API_KEY || API_KEY.includes('YOUR_')) throw new Error('Please set your Gemini API key.');

    const payload = {
        model: "gemini-1.5", // Choose the appropriate Gemini model
        input: `You are an AI assistant helping users understand Indian education policy documents.\n\nDOCUMENTS:\n${ctx}\n\nUSER QUESTION: ${q}\n\nPlease provide a clear, accurate answer based on the documents above. If the information isn't in the documents, say so. Cite specific documents when relevant.`,
        temperature: 0.2,
        max_output_tokens: 1024
    };

    const response = await fetch('https://api.generativeai.googleapis.com/v1beta2/models/gemini-1.5:generateText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Gemini API request failed');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content || "No response from Gemini API.";
}

// Modal display remains unchanged
function showAIRes(q, a) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px';

    const md = document.createElement('div');
    md.style.cssText = 'background:white;border-radius:8px;max-width:700px;max-height:80vh;overflow-y:auto;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.3)';

    md.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">
            <h2 style="margin:0;font-size:18px;color:#1a1a1a">AI Analysis</h2>
            <button id="closeModal" style="background:none;border:none;font-size:24px;cursor:pointer;color:#666">&times;</button>
        </div>
        <div style="background:#f5f5f5;padding:12px;border-radius:4px;margin-bottom:16px">
            <strong style="color:#666;font-size:12px">YOUR QUESTION:</strong>
            <p style="margin:4px 0 0 0;color:#1a1a1a">${escHtml(q)}</p>
        </div>
        <div style="background:#e8f4f8;padding:12px;border-radius:4px;margin-bottom:16px">
            <strong style="color:#0066cc;font-size:12px">AI RESPONSE:</strong>
            <div style="margin:8px 0 0 0;color:#1a1a1a;line-height:1.6;white-space:pre-wrap">${escHtml(a)}</div>
        </div>
        <div style="font-size:11px;color:#999;margin-top:12px">
            Based on ${state.results.length} document(s) • Mode: ${state.filters.mode.toUpperCase()} • Model: Gemini 1.5
        </div>
        <div style="margin-top:16px;display:flex;gap:8px">
            <button id="copyResponse" style="padding:8px 16px;background:#0066cc;color:white;border:none;border-radius:4px;cursor:pointer">Copy Response</button>
            <button id="askFollowup" style="padding:8px 16px;background:#f0f0f0;color:#333;border:none;border-radius:4px;cursor:pointer">Ask Follow-up</button>
        </div>
    `;

    ov.appendChild(md);
    document.body.appendChild(ov);

    $('#closeModal', md).onclick = () => document.body.removeChild(ov);
    $('#copyResponse', md).onclick = () => {
        navigator.clipboard.writeText(`Question: ${q}\n\nAnswer: ${a}`);
        alert('Response copied to clipboard!');
    };
    $('#askFollowup', md).onclick = () => {
        document.body.removeChild(ov);
        setTimeout(() => askAI(), 100);
    };
    ov.onclick = e => e.target === ov && document.body.removeChild(ov);
}

function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML }


function showAIRes(q, a) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px';
    const md = document.createElement('div');
    md.style.cssText = 'background:white;border-radius:8px;max-width:700px;max-height:80vh;overflow-y:auto;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.3)';
    md.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px"><h2 style="margin:0;font-size:18px;color:#1a1a1a">AI Analysis</h2><button id="closeModal" style="background:none;border:none;font-size:24px;cursor:pointer;color:#666">&times;</button></div><div style="background:#f5f5f5;padding:12px;border-radius:4px;margin-bottom:16px"><strong style="color:#666;font-size:12px">YOUR QUESTION:</strong><p style="margin:4px 0 0 0;color:#1a1a1a">${escHtml(q)}</p></div><div style="background:#e8f4f8;padding:12px;border-radius:4px;margin-bottom:16px"><strong style="color:#0066cc;font-size:12px">AI RESPONSE:</strong><div style="margin:8px 0 0 0;color:#1a1a1a;line-height:1.6;white-space:pre-wrap">${escHtml(a)}</div></div><div style="font-size:11px;color:#999;margin-top:12px">Based on ${state.results.length} document(s) • Mode: ${state.filters.mode.toUpperCase()} • Model: Claude Sonnet 4</div><div style="margin-top:16px;display:flex;gap:8px"><button id="copyResponse" style="padding:8px 16px;background:#0066cc;color:white;border:none;border-radius:4px;cursor:pointer">Copy Response</button><button id="askFollowup" style="padding:8px 16px;background:#f0f0f0;color:#333;border:none;border-radius:4px;cursor:pointer">Ask Follow-up</button></div>`;
    ov.appendChild(md); document.body.appendChild(ov);
    $('#closeModal', md).onclick = () => document.body.removeChild(ov);
    $('#copyResponse', md).onclick = () => { navigator.clipboard.writeText(`Question: ${q}\n\nAnswer: ${a}`); alert('Response copied to clipboard!') };
    $('#askFollowup', md).onclick = () => { document.body.removeChild(ov); setTimeout(() => askAI(), 100) };
    ov.onclick = e => e.target === ov && document.body.removeChild(ov);
}

function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML }
