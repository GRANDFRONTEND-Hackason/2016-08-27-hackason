displayMap();
displayIcon(2);

// 日本地図の描画
function displayMap() {

    d3.select("svg").remove();
    var w = d3.select("body").node().getBoundingClientRect().width;
    var h = d3.select("body").node().getBoundingClientRect().height;

    // SVG要素生成
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

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
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .style("fill", "#90ee90"); 
    });

}

// アイコンの取得
function displayIcon(index) {

    var images = [
        'diaper.png',
        'list.png',
        'location.png',
        'onigiri.png',
        'priority.png',
        'tissue.png',
        'towel.png',
        'volume.png',
        'water.png'
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

// 画面リサイズ時の再描画
var timer = false;
window.addEventListener("resize", function(){
    if(timer !== false){
        clearTimeout(timer);
    }
    timer = setTimeout(function(){
        displayMap();
        displayIcon(2);
    }, 10);
});
