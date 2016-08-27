var jsonData;

var bgColor = "#0E1925";
var defaultColor = "#e5e5e5";
var colors = [
    "#e5e5e5",
    "#303a97",
    "#1fb8ec",
    "#8fe934",
    "#fffd38",
    "#e3542a",
    "#df0829"
];

var xhr = new XMLHttpRequest;
xhr.open('GET', 'json/data.json', true);
xhr.send(null);
xhr.onreadystatechange = function() {
    if( this.readyState == 4 && this.status == 200 ) {
        if( this.response ) {
            var res = this.response;
            jsonData = JSON.parse(res);
            displayMap();
        }
    }
}

// 日本地図の描画
function displayMap() {

    d3.select("svg").remove();
    var w = d3.select("body").node().getBoundingClientRect().width;
    var h = d3.select("body").node().getBoundingClientRect().height;

    // SVG要素生成
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .style("background-color", bgColor);

    // 日本地図データ読み込み
    d3.json("../json/japan.topojson", function(json) {
        var japan = topojson.object(json, json.objects.japan).geometries;
     
        // 投影法設定
        var projection = d3.geo.mercator()
            .center([130.5, 32.4800774])
            .translate([w/2, h/2])
            .scale(10000);
     
        // 緯度経度⇒パスデータ変換設定
        var path = d3.geo.path()
            .projection(projection);
     
        // パスデータとして日本地図描画
        svg.selectAll("path")
        .data(japan)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", bgColor)
        .attr("stroke-width", 0.5)
        .style("fill", function(e, i) {
            return getAreaColor(e.properties.name_local);
        })
        .on("mouseover", function(e) {
            d3.select(this)
            .transition()
            .duration(100).ease('linear')
            .attr("opacity",1.0)
            .attr("transform","translate(0,-4)");

            for (var index in jsonData) {
                var areaData = jsonData[index];
                if (areaData.areaName == e.properties.name_local) {
                    // console.log(areaData.areaName);
                    // console.log(areaData.lat);
                    // console.log(areaData.lon);
                    // console.log(areaData.people);
                    // console.log(areaData.priority);
                    for (var index in areaData.resources) {
                        var item = areaData.resources[index];
                        // console.log(item.name);
                        // console.log(item.quantity);
                    }
                }
            }
        })
        .on("mouseout", function(e) {
            d3.select(this)
            .transition()
            .duration(100).ease('linear')
            .attr("opacity",1.0)
            .attr("transform","translate(0,4)");
        });
    });

}

function getAreaColor(areaName) {
    for (var index in jsonData) {
        var areaData = jsonData[index];
        if (areaData.areaName == areaName) {
            return colors[areaData.priority - 1];
        }
    }
    return defaultColor;
}

// アイコンの取得
function displayIcon(index) {

    var images = [
        'diaper_c.png',
        'list_c.png',
        'location_c.png',
        'onigiri_c.png',
        'priority_c.png',
        'tissue_c.png',
        'towel_c.png',
        'volume_c.png',
        'water_c.png'
    ];

    var icon = d3.select("svg")
        .append('image')
        .attr('xlink:href', 'images/' + images[index])
        .attr('width', 100)
        .attr('height', 100)
        .attr('clip-path', 'url(#clip)')
        .attr('x', 50)
        .attr('y', 50);
}
