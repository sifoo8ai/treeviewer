let globalData = [];
const width = window.innerWidth, height = window.innerHeight;
const svg = d3.select("#canvas").append("svg").attr("width", width).attr("height", height)
    .on("click", () => d3.select("#tooltip").style("display", "none"));

const g = svg.append("g");
const zoom = d3.zoom().scaleExtent([0.05, 3]).on("zoom", (e) => g.attr("transform", e.transform));
svg.call(zoom);

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

function renderTree(familyName) {
    g.selectAll("*").remove();
    const filtered = globalData.filter(d => d["Keluarga Utama"] === familyName);
    const nodesData = [{ id: "ROOT", name: familyName, parent: "", year: 1900, dob: "-", type: "waris" }];

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

        nodesData.push({
            id: rawName, name: rawName, parent: parent,
            year: birthYear, dob: d["Tarikh Lahir"] || "-",
            status: d["Status Individu"], gen: d["Generasi"], loc: d["Lokasi Tempat Tinggal"], type: "waris"
        });

        if (d["Nama Pasangan"]) {
            nodesData.push({
                id: rawName + "_S", name: d["Nama Pasangan"], parent: rawName,
                type: "spouse", status: d["Status Pasangan"],
                dob: d["Tarikh Lahir Pasangan"] || d["Tahun Lahir Pasangan"] || "-"
            });
        }
    });

    const root = d3.stratify().id(d => d.id).parentId(d => d.parent)(nodesData);
    
    root.eachBefore(node => {
        if (node.children) {
            node.children.sort((a, b) => (a.data.year || 9999) - (b.data.year || 9999));
        }
    });

    const treeLayout = d3.tree().nodeSize([350, 400]);
    treeLayout(root);

    root.descendants().forEach(d => {
        if (d.data.type === 'spouse') {
            d.y = d.parent.y;
            d.x = d.parent.x + 160;
        }
    });

    g.selectAll(".link").data(root.links().filter(l => l.target.data.type === 'waris'))
        .enter().append("path").attr("class", "link")
        .attr("d", d => {
            const s = d.source, t = d.target;
            const midY = (s.y + t.y) / 2;
            return `M${s.x},${s.y} L${s.x},${midY} L${t.x},${midY} L${t.x},${t.y}`;
        });

    g.selectAll(".marriage").data(root.links().filter(l => l.target.data.type === 'spouse'))
        .enter().append("line").attr("class", "marriage-line")
        .attr("x1", d => d.source.x + 75).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x - 75).attr("y2", d => d.target.y);

    const node = g.selectAll(".node").data(root.descendants()).enter().append("g")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("click", (event, d) => {
            event.stopPropagation();
            const t = d3.select("#tooltip");
            t.style("display", "block").style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px")
             .html(`<strong>${d.data.name}</strong><hr><div class="info-row"><span class="info-label">Tarikh Lahir:</span><span>${d.data.dob}</span></div><div class="info-row"><span class="info-label">Generasi:</span><span>${d.data.gen || 'Pasangan'}</span></div><div class="info-row"><span class="info-label">Status:</span><span>${d.data.status || '-'}</span></div><div class="info-row"><span class="info-label">Lokasi:</span><span>${d.data.loc || '-'}</span></div>`);
        });

    node.append("rect").attr("class", d => `node-rect ${d.data.type==='spouse'?'spouse-rect':'waris-rect'} ${d.data.status?.includes('meninggal')?'deceased-rect':''}`)
        .attr("x", -75).attr("y", -25).attr("width", 150).attr("height", 50);

    node.append("text").attr("class", "name-label").attr("text-anchor", "middle").attr("dy", 2).text(d => d.data.name.length > 20 ? d.data.name.substring(0,18)+'..' : d.data.name);
    node.append("text").attr("class", "year-label").attr("text-anchor", "middle").attr("dy", 15).text(d => (d.data.year && d.data.year < 9999) ? `(${d.data.year})` : "");

    svg.call(zoom.transform, d3.zoomIdentity.translate(width/2, 100).scale(0.5));
}
