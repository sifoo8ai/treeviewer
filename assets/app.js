let globalData = [];
const width = window.innerWidth, height = window.innerHeight;
const svg = d3.select("#canvas").append("svg").attr("width", width).attr("height", height)
    .on("click", () => d3.select("#tooltip").style("display", "none"));

const g = svg.append("g");
const zoom = d3.zoom().scaleExtent([0.05, 3]).on("zoom", (e) => g.attr("transform", e.transform));
svg.call(zoom);

let currentNodes = []; // store for reset view

function cleanStr(str) { return str ? str.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim() : ""; }

function normalizeText(value) {
    return (value || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
}

function displayError(msg) {
    const errorEl = document.getElementById('errorMsg');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = "block";
    }
}

function hideError() {
    const errorEl = document.getElementById('errorMsg');
    if (errorEl) {
        errorEl.style.display = "none";
    }
}

document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const raw = d3.csvParse(event.target.result);
        if (raw.length === 0) return displayError("Fail CSV kosong.");
        
        const requiredCols = ["Keluarga Utama", "Nama Penuh", "Nama Ibu / Bapa"];
        const missingCols = requiredCols.filter(c => !raw.columns.includes(c));
        if (missingCols.length > 0) {
            d3.select("#familySelector").style("display", "none");
            d3.select("#searchContainer").style("display", "none");
            g.selectAll("*").remove(); // Clear tree
            return displayError("Ralat Fail CSV: Kolum wajib tidak dijumpai - " + missingCols.join(", "));
        }
        
        hideError();

        globalData = raw.map(row => {
            const cleanedRow = {};
            for (let key in row) { cleanedRow[cleanStr(key)] = cleanStr(row[key]); }
            return cleanedRow;
        });
        const families = [...new Set(globalData.map(d => d["Keluarga Utama"]))].filter(f => f);
        const selector = document.getElementById('selectFamily');
        selector.innerHTML = families.map(f => `<option value="${f}">${f}</option>`).join('');
        document.getElementById('familySelector').style.display = "block";
        document.getElementById('searchContainer').style.display = "block";
        renderTree(selector.value);
    };
    reader.readAsText(file);
});

document.getElementById('selectFamily').addEventListener('change', (e) => renderTree(e.target.value));

if(document.getElementById('resetViewBtn')) {
    document.getElementById('resetViewBtn').addEventListener('click', () => {
        clearSearchHighlightOnly();
        fitView(currentNodes);
    });
}

function fitView(nodes) {
    if (!nodes || nodes.length === 0) return;
    
    // Calculate bounding box
    const padding = 50;
    const xMin = d3.min(nodes, d => d.x - 60) - padding;
    const xMax = d3.max(nodes, d => d.x + (d.isSpouseNode ? 60 : 60)) + padding;
    const yMin = d3.min(nodes, d => d.y - 20) - padding;
    const yMax = d3.max(nodes, d => d.y + 20) + padding;
    
    const w = xMax - xMin;
    const h = yMax - yMin;
    if (w <= 0 || h <= 0) return;

    const scale = Math.min(width / w, height / h, 1.2);
    const tx = width / 2 - (xMin + w / 2) * scale;
    const ty = height / 2 - (yMin + h / 2) * scale;
    
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}

// SEARCH LOGIC
document.getElementById('searchInput').addEventListener('input', function(e) {
    const query = normalizeText(e.target.value);
    const resultsContainer = document.getElementById('searchResults');
    
    if(!query) {
        clearSearch();
        return;
    }
    
    const matches = currentNodes.filter(n => normalizeText(n.data.name).includes(query));
    if(matches.length > 0) {
        resultsContainer.innerHTML = matches.map(n => `<li data-id="${n.id}">${n.data.name} ${n.isSpouseNode ? '(Pasangan)' : ''}</li>`).join('');
        resultsContainer.style.display = 'block';
        
        // Add click events to li
        resultsContainer.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                focusNode(li.getAttribute('data-id'));
            });
        });
    } else {
        resultsContainer.innerHTML = '<li style="color:#94a3b8;">Tiada padanan.</li>';
        resultsContainer.style.display = 'block';
    }
});

document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchResults').innerHTML = '';
    clearSearchHighlightOnly();
}

function clearSearchHighlightOnly() {
    g.selectAll(".node-rect").classed("node-highlight", false);
}

function focusNode(id) {
    document.getElementById('searchResults').style.display = 'none';

    // finding the node
    const targetNode = currentNodes.find(n => n.id === id);
    if(!targetNode) return;

    // highlight
    clearSearchHighlightOnly();
    g.selectAll(".node").filter(d => d.id === id).select(".node-rect").classed("node-highlight", true);

    // transform
    const scale = 1.3;
    const tx = width / 2 - targetNode.x * scale;
    const ty = height / 2 - targetNode.y * scale;

    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}

function renderTree(familyName) {
    g.selectAll("*").remove();
    clearSearchHighlightOnly();
    const filtered = globalData.filter(d => d["Keluarga Utama"] === familyName);
    
    const warisData = [{ id: "ROOT", name: familyName, parent: "", year: 1900, dob: "-", type: "waris" }];
    const spouseData = [];

    // Internal lookup for matching
    const normTable = {};
    filtered.forEach(d => {
        if(d["Nama Penuh"]) normTable[normalizeText(d["Nama Penuh"])] = true;
    });

    filtered.forEach((d) => {
        const rawName = d["Nama Penuh"];
        if (!rawName) return;
        const normName = normalizeText(rawName);
        if (!normName) return;

        let birthYear = parseInt(d["Tahun Lahir"]);
        if (isNaN(birthYear) && d["Tarikh Lahir"]) {
            const match = d["Tarikh Lahir"].match(/\d{4}/);
            if (match) birthYear = parseInt(match[0]);
        }
        if (isNaN(birthYear)) birthYear = 9999;

        let parentRaw = d["Nama Ibu / Bapa"];
        let normParent = normalizeText(parentRaw);
        
        if (!normParent || !normTable[normParent]) {
            normParent = "ROOT";
        }

        warisData.push({
            id: normName, name: rawName, parent: normParent,
            year: birthYear, dob: d["Tarikh Lahir"] || "-",
            status: d["Status Individu"], gen: d["Generasi"], loc: d["Lokasi Tempat Tinggal"], type: "waris"
        });

        if (d["Nama Pasangan"]) {
            const spouseRaw = d["Nama Pasangan"];
            const normSpouse = normalizeText(spouseRaw);
            spouseData.push({
                id: normSpouse ? (normName + "_S_" + normSpouse) : (normName + "_S"), 
                name: spouseRaw, 
                warisId: normName,
                type: "spouse", 
                status: d["Status Pasangan"],
                dob: d["Tarikh Lahir Pasangan"] || d["Tahun Lahir Pasangan"] || "-"
            });
        }
    });

    try {
        const root = d3.stratify().id(d => d.id).parentId(d => d.parent)(warisData);
        
        root.eachBefore(node => {
            if (node.children) {
                node.children.sort((a, b) => (a.data.year || 9999) - (b.data.year || 9999));
            }
        });

        const treeLayout = d3.tree()
            .nodeSize([200, 150])
            .separation((a, b) => {
                const aWider = spouseData.some(s => s.warisId === a.id);
                const bWider = spouseData.some(s => s.warisId === b.id);
                return (a.parent === b.parent ? 1.1 : 1.3) + ((aWider || bWider) ? 0.6 : 0);
            });
        
        treeLayout(root);

        let allNodes = root.descendants();
        let familyCenters = {};
        
        // Attach spouses manually
        spouseData.forEach(spouse => {
            const warisNode = allNodes.find(n => n.id === spouse.warisId);
            if (warisNode) {
                allNodes.push({
                    id: spouse.id,
                    data: spouse,
                    x: warisNode.x + 130, // Offset to the right
                    y: warisNode.y,
                    parent: warisNode,
                    isSpouseNode: true
                });
                familyCenters[spouse.warisId] = {
                    x: warisNode.x + 65,
                    y: warisNode.y
                };
            }
        });

        currentNodes = allNodes;

        // Draw links for waris
        g.selectAll(".link").data(root.links())
            .enter().append("path").attr("class", "link")
            .attr("d", d => {
                const fc = familyCenters[d.source.id];
                const sX = fc ? fc.x : d.source.x;
                const sY = fc ? fc.y : d.source.y;
                const t = d.target;
                const midY = (sY + t.y) / 2;
                return `M${sX},${sY} L${sX},${midY} L${t.x},${midY} L${t.x},${t.y}`;
            });

        // Draw links for spouses
        const marriageLinks = allNodes.filter(n => n.isSpouseNode).map(n => ({ source: n.parent, target: n }));
        g.selectAll(".marriage").data(marriageLinks)
            .enter().append("line").attr("class", "marriage-line")
            .attr("x1", d => d.source.x + 60).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x - 60).attr("y2", d => d.target.y);

        const node = g.selectAll(".node").data(allNodes).enter().append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .on("click", (event, d) => {
                event.stopPropagation();
                const t = d3.select("#tooltip");
                t.style("display", "block")
                 .html(`<strong>${d.data.name}</strong><hr><div class="info-row"><span class="info-label">Tarikh Lahir:</span><span>${d.data.dob}</span></div><div class="info-row"><span class="info-label">Generasi:</span><span>${d.data.gen || 'Pasangan'}</span></div><div class="info-row"><span class="info-label">Status:</span><span>${d.data.status || '-'}</span></div><div class="info-row"><span class="info-label">Lokasi:</span><span>${d.data.loc || '-'}</span></div>`);
                 
                // Viewport-safe adjustment
                const tNode = t.node();
                const tWidth = tNode.offsetWidth;
                const tHeight = tNode.offsetHeight;
                
                let left = event.pageX + 15;
                let top = event.pageY - 15;
                
                if (left + tWidth > window.innerWidth) {
                    left = event.pageX - tWidth - 15;
                }
                if (top + tHeight > window.innerHeight) {
                    top = event.pageY - tHeight - 15;
                }
                
                t.style("left", left + "px").style("top", top + "px");
            });

        node.append("rect").attr("class", d => `node-rect ${d.data.type==='spouse'?'spouse-rect':'waris-rect'} ${normalizeText(d.data.status).includes('meninggal')?'deceased-rect':''}`)
            .attr("x", -60).attr("y", -20).attr("width", 120).attr("height", 40);

        node.append("text").attr("class", "name-label").attr("text-anchor", "middle").attr("dy", -2).text(d => d.data.name.length > 18 ? d.data.name.substring(0,16)+'..' : d.data.name);
        node.append("text").attr("class", "year-label").attr("text-anchor", "middle").attr("dy", 12).text(d => (d.data.year && d.data.year < 9999) ? `(${d.data.year})` : "");

        fitView(allNodes);
    } catch (err) {
        console.error(err);
        displayError("Ralat struktur CSV: Gagal memadankan data hierarki keluarga.");
    }
}
