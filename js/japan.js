displayMap();
displayIcon(2);
displayGraph();

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
        'https://assets-cdn.github.com/images/modules/open_graph/github-octocat.png',
        'http://jsrun.it/assets/t/9/p/m/t9pm6.jpg',
        'http://jsrun.it/assets/1/E/m/P/1EmPa.jpg',
        'http://jsrun.it/assets/z/m/t/G/zmtGr.jpg',
        'http://jsrun.it/assets/j/m/K/P/jmKP9.jpg',
        'http://jsrun.it/assets/s/R/9/y/sR9yF.jpg',
        'http://jsrun.it/assets/g/G/C/m/gGCmv.jpg',
        'http://jsrun.it/assets/4/K/T/B/4KTBL.jpg',
        'http://jsrun.it/assets/l/f/V/0/lfV0z.jpg',
        'http://jsrun.it/assets/h/g/0/5/hg05Z.jpg'
    ];

    var images = d3.select("svg")
        .append('image')
        .attr('xlink:href', images[index])
        .attr('width', 100)
        .attr('height', 100)
        .attr('clip-path', 'url(#clip)')
        .attr('x', 50)
        .attr('y', 50);
}

// 円グラフ表示
function displayGraph() {
    // 表示サイズを設定
    var size = {
      width: 400,
      height:400
    };

    // 円グラフの表示データ
    var data = [
        {legend:"おにぎり", value:40, color:"#e74c3c"},
        {legend:"水", value:10, color:"#f39c12"},
        {legend:"おむつ", value:15, color:"#16a085"},
        {legend:"ティッシュ", value:25, color:"#d35400"},
        {legend:"タオル", value:30, color:"#2c3e50"}
    ];

    // SVG要素生成
    var svg = d3.select("body")
        .append("svg")
        .attr("id", "chart");

    // d3用の変数
    var svg = d3.select("#chart"),
        pie = d3.layout.pie().sort(null).value(function(d){ return d.value; }),
        arc = d3.svg.arc().innerRadius(0).outerRadius(size.width / 2);

    // グループの作成
    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("transform", "translate(" + (size.width / 2) + "," + (size.width / 2) + ")")
        .attr("class", "arc");

    // 円弧の作成
    g.append("path")
        .attr("d", arc)
        .attr("stroke", "white")
        .attr("fill", function(d){console.log(arc.centroid(d)); return d.data.color; });

    // データの表示
    var maxValue = d3.max(data,function(d){ return d.value; });

    // データの表示
    g.append("text")
        .attr("dy", ".35em")
        .attr("font-size", function(d){ return d.value / maxValue * 20; })
        .style("text-anchor", "middle")
        .text(function(d){ return d.data.legend; });

    // テキストの位置を再調整
    g.selectAll("text").attr("transform", function(d){ return "translate(" + arc.centroid(d) + ")"; });
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