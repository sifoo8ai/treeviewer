let globalData = [];
const width = window.innerWidth, height = window.innerHeight;
const svg = d3.select("#canvas").append("svg").attr("width", width).attr("height", height)
    .on("click", () => d3.select("#tooltip").style("display", "none"));

const g = svg.append("g");
const zoom = d3.zoom().scaleExtent([0.05, 3]).on("zoom", (e) => g.attr("transform", e.transform));
svg.call(zoom);

let currentNodes = []; // store for reset view

function cleanStr(str) { return str ? str.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim() : ""; }

document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const raw = d3.csvParse(event.target.result);
        globalData = raw.map(row => {
            const cleanedRow = {};
            for (let key in row) { cleanedRow[cleanStr(key)] = cleanStr(row[key]); }
            return cleanedRow;
        });
        const families = [...new Set(globalData.map(d => d["Keluarga Utama"]))].filter(f => f);
        const selector = document.getElementById('selectFamily');
        selector.innerHTML = families.map(f => `<option value="${f}">${f}</option>`).join('');
        document.getElementById('familySelector').style.display = "block";
        renderTree(selector.value);
    };
    reader.readAsText(file);
});

document.getElementById('selectFamily').addEventListener('change', (e) => renderTree(e.target.value));

if(document.getElementById('resetViewBtn')) {
    document.getElementById('resetViewBtn').addEventListener('click', () => {
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

function renderTree(familyName) {
    g.selectAll("*").remove();
    const filtered = globalData.filter(d => d["Keluarga Utama"] === familyName);
    
    const warisData = [{ id: "ROOT", name: familyName, parent: "", year: 1900, dob: "-", type: "waris" }];
    const spouseData = [];

    filtered.forEach((d) => {
        const rawName = d["Nama Penuh"];
        if (!rawName) return;
        
        let birthYear = parseInt(d["Tahun Lahir"]);
        if (isNaN(birthYear) && d["Tarikh Lahir"]) {
            const match = d["Tarikh Lahir"].match(/\d{4}/);
            if (match) birthYear = parseInt(match[0]);
        }
        if (isNaN(birthYear)) birthYear = 9999;

        let parent = d["Nama Ibu / Bapa"];
        if (!filtered.some(f => f["Nama Penuh"] === parent) || !parent) parent = "ROOT";

        warisData.push({
            id: rawName, name: rawName, parent: parent,
            year: birthYear, dob: d["Tarikh Lahir"] || "-",
            status: d["Status Individu"], gen: d["Generasi"], loc: d["Lokasi Tempat Tinggal"], type: "waris"
        });

        if (d["Nama Pasangan"]) {
            spouseData.push({
                id: rawName + "_S", name: d["Nama Pasangan"], warisId: rawName,
                type: "spouse", status: d["Status Pasangan"],
                dob: d["Tarikh Lahir Pasangan"] || d["Tahun Lahir Pasangan"] || "-"
            });
        }
    });

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
            t.style("display", "block").style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px")
             .html(`<strong>${d.data.name}</strong><hr><div class="info-row"><span class="info-label">Tarikh Lahir:</span><span>${d.data.dob}</span></div><div class="info-row"><span class="info-label">Generasi:</span><span>${d.data.gen || 'Pasangan'}</span></div><div class="info-row"><span class="info-label">Status:</span><span>${d.data.status || '-'}</span></div><div class="info-row"><span class="info-label">Lokasi:</span><span>${d.data.loc || '-'}</span></div>`);
        });

    node.append("rect").attr("class", d => `node-rect ${d.data.type==='spouse'?'spouse-rect':'waris-rect'} ${d.data.status?.includes('meninggal')?'deceased-rect':''}`)
        .attr("x", -60).attr("y", -20).attr("width", 120).attr("height", 40);

    node.append("text").attr("class", "name-label").attr("text-anchor", "middle").attr("dy", -2).text(d => d.data.name.length > 18 ? d.data.name.substring(0,16)+'..' : d.data.name);
    node.append("text").attr("class", "year-label").attr("text-anchor", "middle").attr("dy", 12).text(d => (d.data.year && d.data.year < 9999) ? `(${d.data.year})` : "");

    fitView(allNodes);
}
